#!/usr/bin/env python3
"""Parçalanmış TTS çıktılarını tek, tutarlı bir ses dosyasında birleştirir + QC.

Neden gerekli: tek tek üretilen parçalar normalde "aynı ses" gibi duyulur ama
dikiş yerlerinde üç şey bozar:
  1. her parçanın başındaki/sonundaki değişken sessizlik → ritim bozulur
  2. parça başına farklı kayıt seviyesi → ses yükselip alçalır
  3. cümle ortası kesim → prozodi (tonlama) yarım kalır

Bu script sırasıyla: sessizlik kırp → sabit nefes boşluğu ekle → tek geçişte
loudnorm → dikiş noktalarını ölç (QC raporu).

Kullanım:
    python3 tools/tts_concat.py --in build/audio --out build/final.mp3 \
        --manifest build/manifest.json --report build/qc.json
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

AUDIO_EXT = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".opus", ".flac", ".aiff"}


# ---------------------------------------------------------------- ffmpeg bulma
def find_ffmpeg() -> str:
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:  # ffmpeg binary'si olmayan ortamlar için
        import imageio_ffmpeg  # type: ignore

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        sys.exit("ffmpeg bulunamadı: `apt install ffmpeg` veya `pip install imageio-ffmpeg`")


FFMPEG = None


def run(args: list[str]) -> subprocess.CompletedProcess:
    """ffmpeg çalıştır; tüm loglar stderr'de toplanır (ffmpeg stdout'a log basmaz)."""
    assert FFMPEG
    return subprocess.run([FFMPEG, "-hide_banner", "-nostdin", *args],
                          capture_output=True, text=True)


def probe_duration(path: Path) -> float:
    """süre (sn) — ffprobe yoksa ffmpeg stderr'inden okur."""
    ffprobe = shutil.which("ffprobe")
    if ffprobe:
        out = subprocess.run(
            [ffprobe, "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(path)],
            capture_output=True, text=True).stdout.strip()
        try:
            return float(out)
        except ValueError:
            pass
    res = run(["-i", str(path), "-f", "null", "-"])
    m = re.search(r"time=(\d+):(\d+):(\d+\.?\d*)", res.stderr or "")
    if not m:
        raise RuntimeError(f"süre okunamadı: {path}")
    h, mi, s = m.groups()
    return int(h) * 3600 + int(mi) * 60 + float(s)


# ------------------------------------------------------------- ses işleme
TRIM_FILTER = (
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
    "areverse,"
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
    "areverse"
)

SAMPLE_RATE = 48000


def trim_silence(src: Path, dst: Path) -> None:
    """Baş/son sessizliği kırp (iç sessizliklere DOKUNMA)."""
    res = run(["-y", "-i", str(src), "-af", TRIM_FILTER,
               "-ar", str(SAMPLE_RATE), "-ac", "1", "-c:a", "pcm_s16le", str(dst)])
    if res.returncode != 0:
        raise RuntimeError(f"trim başarısız {src.name}: {res.stderr[-600:]}")


def make_gap(dst: Path, seconds: float) -> None:
    res = run(["-y", "-f", "lavfi", "-i",
               f"anullsrc=r={SAMPLE_RATE}:cl=mono", "-t", f"{seconds:.3f}",
               "-c:a", "pcm_s16le", str(dst)])
    if res.returncode != 0:
        raise RuntimeError(f"gap üretilemedi: {res.stderr[-600:]}")


def concat(sources: list[Path], dst: Path) -> None:
    listfile = dst.with_suffix(".txt")
    listfile.write_text(
        "".join(f"file '{p.resolve()}'\n" for p in sources), encoding="utf-8")
    res = run(["-y", "-f", "concat", "-safe", "0", "-i", str(listfile),
               "-c:a", "pcm_s16le", "-ar", str(SAMPLE_RATE), "-ac", "1", str(dst)])
    if res.returncode != 0:
        raise RuntimeError(f"concat başarısız: {res.stderr[-800:]}")


def loudnorm(src: Path, dst: Path, i: float = -16.0, tp: float = -1.5,
             lra: float = 11.0, two_pass: bool = True) -> None:
    """Hedef LUFS'a normalize et.

    two_pass=True: önce ölç (loudnorm JSON), sonra ölçülen değerleri vererek uygula.
    Tek geçiş uzun/durağan olmayan seste 1-3 LU sapabilir; iki geçiş hedefi tutturur.
    TTS gibi sabit seviyeli kaynaklarda bile parça birleşimi seviyeyi kaydırdığı için
    iki geçiş varsayılandır.
    """
    measured = None
    if two_pass:
        res = run(["-i", str(src), "-af", f"loudnorm=I={i}:TP={tp}:LRA={lra}:print_format=json",
                   "-f", "null", "-"])
        m = re.search(r"\{[^{}]*\"input_i\"[\s\S]*?\}", res.stderr or "")
        if m:
            try:
                measured = json.loads(m.group(0))
            except json.JSONDecodeError:
                measured = None

    af = f"loudnorm=I={i}:TP={tp}:LRA={lra}"
    if measured:
        af += (f":measured_I={measured['input_i']}:measured_TP={measured['input_tp']}"
               f":measured_LRA={measured['input_lra']}"
               f":measured_thresh={measured['input_thresh']}"
               f":offset={measured.get('target_offset', '0.0')}:linear=true")
    else:
        af += ":linear=true"

    res = run(["-y", "-i", str(src), "-af", af, "-ar", str(SAMPLE_RATE),
               "-ac", "1", "-c:a", "pcm_s16le", str(dst)])
    if res.returncode != 0:
        raise RuntimeError(f"loudnorm başarısız: {res.stderr[-800:]}")


def integrated_lufs(path: Path) -> float | None:
    """Dosyanın bütünleşik ses yüksekliği (LUFS) — QC için."""
    res = run(["-i", str(path), "-af", "loudnorm=print_format=json", "-f", "null", "-"])
    m = re.search(r"\{[^{}]*\"input_i\"[\s\S]*?\}", res.stderr or "")
    if not m:
        return None
    try:
        return round(float(json.loads(m.group(0))["input_i"]), 2)
    except (json.JSONDecodeError, KeyError, ValueError):
        return None


def encode(src: Path, dst: Path, bitrate: str = "192k") -> None:
    codec = {"mp3": "libmp3lame", "wav": "pcm_s16le", "m4a": "aac",
             "flac": "flac", "ogg": "libvorbis"}.get(dst.suffix.lstrip("."), "libmp3lame")
    args = ["-y", "-i", str(src), "-c:a", codec]
    if codec in {"libmp3lame", "aac", "libvorbis"}:
        args += ["-b:a", bitrate]
    args.append(str(dst))
    res = run(args)
    if res.returncode != 0:
        raise RuntimeError(f"encode başarısız: {res.stderr[-800:]}")


# ------------------------------------------------------------------- QC
def rms_dbfs(path: Path) -> float | None:
    """Dosyanın ortalama seviyesi (RMS, dBFS). astats ile ölçülür."""
    res = run(["-i", str(path), "-af", "astats=metadata=1:reset=0",
               "-f", "null", "-"])
    m = re.findall(r"RMS level dB:\s*(-?\d+\.?\d*|-inf)", res.stderr or "")
    if not m:
        return None
    vals = [float(v) for v in m if v not in ("-inf",)]
    return round(sum(vals) / len(vals), 2) if vals else None


def edge_levels(path: Path, window: float = 0.35) -> tuple[float | None, float | None]:
    """Parçanın ilk ve son <window> saniyesinin RMS seviyesi."""
    dur = probe_duration(path)
    if dur <= 0.05:
        return None, None
    def seg(start: float, length: float) -> float | None:
        res = run(["-ss", f"{start:.3f}", "-t", f"{length:.3f}", "-i", str(path),
                   "-af", "astats=metadata=1:reset=0", "-f", "null", "-"])
        m = re.search(r"RMS level dB:\s*(-?\d+\.?\d*|-inf)", res.stderr or "")
        if not m or m.group(1) == "-inf":
            return None
        return round(float(m.group(1)), 2)
    head = seg(0.0, min(window, dur))
    tail = seg(max(0.0, dur - window), min(window, dur))
    return head, tail


def build_report(parts: list[Path], report_path: Path | None) -> dict:
    rep = {"parts": [], "joins": []}
    for p in parts:
        rep["parts"].append({"file": p.name,
                             "duration_s": round(probe_duration(p), 2),
                             "rms_dbfs": rms_dbfs(p),
                             "lufs": integrated_lufs(p)})
    for a, b in zip(parts, parts[1:]):
        _, a_tail = edge_levels(a)
        b_head, _ = edge_levels(b)
        delta = None
        if a_tail is not None and b_head is not None:
            delta = round(abs(a_tail - b_head), 2)
        rep["joins"].append({
            "from": a.name, "to": b.name,
            "tail_rms_dbfs": a_tail, "head_rms_dbfs": b_head,
            "level_jump_db": delta,
            "ok": (delta is None or delta <= 6.0),
        })
    if report_path:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(rep, ensure_ascii=False, indent=2),
                               encoding="utf-8")
    return rep


# ------------------------------------------------------------------ main
def natural_key(p: Path) -> list:
    return [int(t) if t.isdigit() else t.lower()
            for t in re.split(r"(\d+)", p.name)]


def main(argv: list[str] | None = None) -> int:
    global FFMPEG
    ap = argparse.ArgumentParser(description="TTS parçalarını birleştir + QC")
    ap.add_argument("--in", dest="indir", required=True,
                    help="parça dosyalarının olduğu klasör (doğal sırada okunur)")
    ap.add_argument("--out", required=True, help="çıktı dosyası (.mp3/.wav/.m4a/...)")
    ap.add_argument("--gap", type=float, default=0.35, help="parça arası sessizlik (sn)")
    ap.add_argument("--lufs", type=float, default=-16.0, help="hedef LUFS (YouTube: -14~-16)")
    ap.add_argument("--no-normalize", action="store_true", help="loudnorm uygulama")
    ap.add_argument("--keep-temp", action="store_true", help="ara dosyaları sakla")
    ap.add_argument("--report", help="QC raporu (JSON) yolu")
    args = ap.parse_args(argv)

    FFMPEG = find_ffmpeg()

    indir = Path(args.indir)
    parts = sorted([p for p in indir.iterdir()
                    if p.is_file() and p.suffix.lower() in AUDIO_EXT], key=natural_key)
    if not parts:
        sys.exit(f"parça bulunamadı: {indir}")
    if len(parts) == 1:
        print("Tek parça var — birleştirmeye gerek yok.")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    tmp = Path(tempfile.mkdtemp(prefix="ttsjoin_"))
    try:
        trimmed: list[Path] = []
        for p in parts:
            t = tmp / f"trim_{p.stem}.wav"
            trim_silence(p, t)
            if probe_duration(t) < 0.05:
                print(f"⚠ atlandı (boş): {p.name}")
                continue
            trimmed.append(t)
        if not trimmed:
            sys.exit("tüm parçalar boş çıktı")

        gap = tmp / "gap.wav"
        make_gap(gap, args.gap)

        sequence: list[Path] = []
        for i, t in enumerate(trimmed):
            if i:
                sequence.append(gap)
            sequence.append(t)

        raw = tmp / "raw.wav"
        concat(sequence, raw)

        stage = raw
        if not args.no_normalize:
            norm = tmp / "norm.wav"
            loudnorm(raw, norm, i=args.lufs)
            stage = norm

        encode(stage, out)

        rep = build_report(trimmed, None)
        rep["output"] = {"file": out.name,
                         "duration_s": round(probe_duration(out), 2),
                         "lufs": integrated_lufs(out),
                         "target_lufs": None if args.no_normalize else args.lufs}
        if args.report:
            rp = Path(args.report)
            rp.parent.mkdir(parents=True, exist_ok=True)
            rp.write_text(json.dumps(rep, ensure_ascii=False, indent=2), encoding="utf-8")
    finally:
        if not args.keep_temp:
            shutil.rmtree(tmp, ignore_errors=True)

    dur = probe_duration(out)
    print(f"✓ {out}  ({dur:.1f} sn / {dur/60:.2f} dk)  ← {len(trimmed)} parça, "
          f"{len(trimmed)-1} dikiş")
    if rep["output"]["lufs"] is not None:
        tgt = rep["output"]["target_lufs"]
        extra = "" if tgt is None else f"  (hedef {tgt:+.1f} LUFS)"
        print(f"  ses yüksekliği: {rep['output']['lufs']:+.1f} LUFS{extra}")
    bad = [j for j in rep["joins"] if not j["ok"]]
    if bad:
        print(f"⚠ {len(bad)} dikişte seviye sıçraması > 6 dB:")
        for j in bad:
            print(f"   {j['from']} → {j['to']}: {j['tail_rms_dbfs']} / "
                  f"{j['head_rms_dbfs']} dBFS (Δ{j['level_jump_db']})")
        print("   öneri: bu parçaları aynı voice_id/parametrelerle yeniden üret")
    else:
        print("  QC: tüm dikişlerde seviye sürekliliği normal (≤6 dB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
