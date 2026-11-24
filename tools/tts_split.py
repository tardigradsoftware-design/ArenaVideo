#!/usr/bin/env python3
"""Cümle-farkında metin bölücü.

TTS API'lerinin çağrı başına karakter limiti (ör. ~1500) yüzünden uzun metinler
parçalanmak zorunda. Bu script parçaları *anlamlı* sınırlardan keser, çünkü
duyulan asıl bozulma "ses kalitesi" değil, cümle ortasından kesilen prozodidir.

Kurallar:
  - Öncelik: paragraf sınırı > cümle sınırı > virgül/noktalı virgül
  - Kısaltmalar (Dr., vb., örn., T.C. ...) ve sayılar (3.5, 1.000, 24.11.2026)
    asla bölme noktası sayılmaz.
  - Hedef parça boyu güvenlik payıyla sınırın altında tutulur.

Kullanım:
    python3 tools/tts_split.py --text metin.txt --max-chars 1400 --out build/
    python3 tools/tts_split.py --text metin.txt --max-chars 1400 --json-only
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

# Noktayla bitip cümle sonu SAYILMAYAN kısaltmalar (TR + EN yaygın).
ABBREVIATIONS = {
    "dr", "doç", "doc", "prof", "öğr", "ogr", "gör", "gor", "av", "sn", "bn",
    "vb", "vs", "örn", "orn", "bkz", "bs", "yy", "no", "nu", "tel", "faks",
    "cad", "sok", "apt", "mah", "blv", "sk", "k", "tl", "usd", "eur",
    "mö", "mo", "ms", "mm", "cm", "km", "kg", "gr", "ml", "lt", "dk", "sn",
    "mr", "mrs", "ms", "jr", "sr", "st", "etc", "e.g", "i.e", "fig", "vol",
    "ch", "p", "pp", "ed", "est", "approx", "dept", "univ", "inc", "ltd", "co",
}

# Cümle sonu adayı: . ! ? … ardından boşluk + (büyük harf | rakam | tırnak | parantez)
SENTENCE_END = re.compile(r"(?<=[.!?…])[\"'”’)\]]?\s+(?=[A-ZÇĞİÖŞÜ0-9\"'“‘(\[])")
PARAGRAPH_END = re.compile(r"\n[ \t]*\n+")


@dataclass
class Chunk:
    index: int
    text: str
    chars: int
    boundaries: list[str]  # bu parçanın hangi sınırlardan kesildiği (debug için)


def _is_abbreviation(prefix: str) -> bool:
    """prefix: cümle sonu noktasından ÖNCEKİ son kelime parçası."""
    token = prefix.rstrip(".").split()[-1] if prefix.strip() else ""
    token = token.lstrip("([\"'“‘").lower()
    if not token:
        return False
    # Tek harf (kişi adı baş harfi: "A. Yılmaz")
    if len(token) == 1 and token.isalpha():
        return True
    return token in ABBREVIATIONS


def _split_sentences(paragraph: str) -> list[str]:
    """Paragrafı cümlelere ayırır, kısaltma/sayı yanlış pozitiflerini eler."""
    pieces: list[str] = []
    last = 0
    for m in SENTENCE_END.finditer(paragraph):
        dot = m.start()  # '.' konumu
        before = paragraph[last:dot]
        # Ondalık/binlik sayı mı? "3.5", "1.000"
        if dot + 1 < len(paragraph) and paragraph[dot + 1].isdigit():
            continue
        if dot > 0 and paragraph[dot - 1].isdigit() and " " not in before[-1:]:
            # "24.11.2026" gibi tarih zinciri
            continue
        if _is_abbreviation(before):
            continue
        pieces.append(paragraph[last:dot + 1].strip())
        last = m.end()
    tail = paragraph[last:].strip()
    if tail:
        pieces.append(tail)
    return [p for p in pieces if p]


def _hard_wrap(text: str, max_chars: int) -> list[str]:
    """Cümle tek başına bile sığmıyorsa: virgül > noktalı virgül > kelime."""
    if len(text) <= max_chars:
        return [text]
    out: list[str] = []
    rest = text
    while len(rest) > max_chars:
        window = rest[:max_chars]
        for sep in ("; ", ", ", ": ", " — ", " – ", " - "):
            cut = window.rfind(sep)
            if cut > max_chars * 0.5:
                out.append(rest[: cut + len(sep)].strip())
                rest = rest[cut + len(sep):].lstrip()
                break
        else:
            cut = window.rfind(" ")
            if cut < max_chars * 0.5:
                cut = max_chars
            out.append(rest[:cut].strip())
            rest = rest[cut:].lstrip()
    if rest:
        out.append(rest)
    return out


def split_text(text: str, max_chars: int = 1400, min_chars: int = 0) -> list[Chunk]:
    """Metni cümle-farkında parçalara böler.

    Parçalar ardışık cümlelerden oluşturulur; hiçbir parça max_chars'ı geçmez.
    min_chars: son parça çok küçükse (ör. 12 karakter) bir öncekine yapıştırılır.
    """
    if max_chars < 50:
        raise ValueError("max_chars en az 50 olmalı")

    paragraphs = [p.strip() for p in PARAGRAPH_END.split(text) if p.strip()]
    units: list[tuple[str, str]] = []  # (metin, kesim türü)
    for para in paragraphs:
        for sent in _split_sentences(para):
            for piece in _hard_wrap(sent, max_chars):
                units.append((piece, "sentence" if piece == sent else "clause"))

    chunks: list[Chunk] = []
    buf: list[str] = []
    buf_len = 0
    buf_bounds: list[str] = []

    def flush(reason: str) -> None:
        nonlocal buf, buf_len, buf_bounds
        if not buf:
            return
        joined = " ".join(buf).strip()
        chunks.append(Chunk(len(chunks), joined, len(joined), buf_bounds + [reason]))
        buf, buf_len, buf_bounds = [], 0, []

    for piece, kind in units:
        added = len(piece) + (1 if buf else 0)
        if buf and buf_len + added > max_chars:
            flush("max-chars")
        buf.append(piece)
        buf_len += added
    flush("end")

    # Çok küçük kuyruk parçasını birleştir
    if len(chunks) > 1 and chunks[-1].chars < min_chars:
        tail = chunks.pop()
        prev = chunks[-1]
        merged = prev.text + " " + tail.text
        if len(merged) <= max_chars * 1.15:
            chunks[-1] = Chunk(prev.index, merged, len(merged),
                               prev.boundaries[:-1] + ["end"])

    return chunks


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="TTS için cümle-farkında metin bölücü")
    ap.add_argument("--text", required=True, help="girdi metin dosyası (UTF-8)")
    ap.add_argument("--max-chars", type=int, default=1400)
    ap.add_argument("--min-chars", type=int, default=200)
    ap.add_argument("--out", help="parçaları <out>/chunks/chunk_00.txt olarak yaz")
    ap.add_argument("--json", help="manifest JSON yolu")
    ap.add_argument("--json-only", action="store_true", help="sadece JSON bas")
    args = ap.parse_args(argv)

    text = Path(args.text).read_text(encoding="utf-8")
    chunks = split_text(text, args.max_chars, args.min_chars)

    manifest = {
        "source_chars": len(text),
        "max_chars": args.max_chars,
        "chunk_count": len(chunks),
        "joins": max(0, len(chunks) - 1),
        "chunks": [asdict(c) for c in chunks],
    }

    if args.out:
        cdir = Path(args.out) / "chunks"
        cdir.mkdir(parents=True, exist_ok=True)
        for c in chunks:
            (cdir / f"chunk_{c.index:02d}.txt").write_text(c.text, encoding="utf-8")
        manifest["chunks_dir"] = str(cdir)

    if args.json:
        Path(args.json).parent.mkdir(parents=True, exist_ok=True)
        Path(args.json).write_text(json.dumps(manifest, ensure_ascii=False, indent=2),
                                   encoding="utf-8")

    if args.json_only:
        print(json.dumps(manifest, ensure_ascii=False, indent=2))
        return 0

    print(f"Kaynak: {len(text)} karakter → {len(chunks)} parça, "
          f"{max(0, len(chunks) - 1)} birleşme noktası")
    for c in chunks:
        flag = "⚠" if c.chars > args.max_chars else " "
        print(f" {flag} [{c.index}] {c.chars:>5} kr — {c.text[:62].replace(chr(10), ' ')}…")
    return 0


if __name__ == "__main__":
    sys.exit(main())
