#!/usr/bin/env python3
"""Kodla çizilmiş sahneleri diyalog sesleriyle dikey videoya birleştir."""
import subprocess, os

FF = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2"
W, H, FPS = 1080, 1920, 25
FADE = 0.4
os.makedirs("video/code-clips", exist_ok=True)

scenes = [
    (1, "scene-1-kirmizidosya.mp3", 5.52),
    (2, "scene-2-ali.mp3", 6.76),
    (3, "scene-3-kirmizidosya.mp3", 4.44),
    (4, "scene-4-terazi.mp3", 6.12),
    (5, "scene-5-ali.mp3", 2.84),
    (6, "scene-6-kirmizidosya.mp3", 2.16),
]

# Step 1: per-scene vertical clips WITH dialogue audio + Ken Burns
for i, audio, dur in scenes:
    zoom = "1+0.0005*on"
    d_frames = int(dur * FPS)
    vf = (
        f"[0:v]split[a][b];"
        f"[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=25:2,eq=brightness=-0.35[bg];"
        f"[b]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];"
        f"[bg][fg]overlay=(W-w)/2:(H-h)/2,"
        f"zoompan=z='{zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={d_frames}:s={W}x{H}:fps={FPS}[v]"
    )
    subprocess.run([
        FF, "-y", "-loop", "1", "-i", f"video/code-scenes/scene-{i}.png",
        "-i", f"video/dialogue/{audio}",
        "-filter_complex", vf,
        "-map", "[v]", "-map", "1:a",
        "-t", str(dur), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS),
        "-c:a", "aac", "-b:a", "128k", "-shortest",
        f"video/code-clips/clip-{i}.mp4"
    ], check=True)
    print(f"clip {i} done ({dur}s)", flush=True)

# Step 2: concat all clips via filter (video + audio)
inputs = []
for i, _, _ in scenes:
    inputs += ["-i", f"video/code-clips/clip-{i}.mp4"]

in_labels = "".join(f"[{idx}:v][{idx}:a]" for idx in range(len(scenes)))
vf = f"{in_labels}concat=n={len(scenes)}:v=1:a=1[vout][aout]"

subprocess.run([
    FF, "-y", *inputs,
    "-filter_complex", vf,
    "-map", "[vout]", "-map", "[aout]",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS),
    "-c:a", "aac", "-b:a", "128k", "-shortest",
    "video/mascot-legal-story-code.mp4"
], check=True)
print("FINAL CODE-DRAWN VERTICAL VIDEO DONE", flush=True)
