import subprocess, os

FF = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2"
W, H, FPS = 1280, 720, 25
SCENE_DUR = 6.6
FADE = 0.5
os.makedirs("video/clips", exist_ok=True)

# Step 1: per-scene clips with blurred-bg composite + Ken Burns zoom
for i in range(1, 7):
    zoom_in = (i % 2 == 1)
    zexpr = "1+0.0009*on" if zoom_in else "1.18-0.0009*on"
    vf = (
        f"[0:v]split[a][b];"
        f"[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=20:2,eq=brightness=-0.35[bg];"
        f"[b]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];"
        f"[bg][fg]overlay=(W-w)/2:(H-h)/2,"
        f"zoompan=z='{zexpr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={int(SCENE_DUR*FPS)}:s={W}x{H}:fps={FPS}"
    )
    subprocess.run([FF, "-y", "-i", f"video/scenes/scene-{i}.png", "-filter_complex", vf,
                    "-t", str(SCENE_DUR), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS),
                    f"video/clips/clip-{i}.mp4"], check=True)
    print(f"clip {i} done", flush=True)

# Step 2: xfade chain + narration audio
inputs = []
for i in range(1, 7):
    inputs += ["-i", f"video/clips/clip-{i}.mp4"]
inputs += ["-i", "video/narration.mp3"]

fc = ""
prev = "[0:v]"
offset = SCENE_DUR - FADE
for i in range(1, 6):
    out = f"[v{i}]"
    fc += f"{prev}[{i}:v]xfade=transition=fade:duration={FADE}:offset={offset:.2f}{out};"
    prev = out
    offset += SCENE_DUR - FADE
# total duration = 6*6.6 - 5*0.5 = 37.1s
fc += f"{prev}fade=t=in:st=0:d=0.5,fade=t=out:st=36.6:d=0.5[vout];"
fc += "[6:a]apad,afade=t=out:st=36.5:d=0.8[aout]"

subprocess.run([FF, "-y", *inputs, "-filter_complex", fc,
                "-map", "[vout]", "-map", "[aout]",
                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS),
                "-c:a", "aac", "-b:a", "128k", "-shortest",
                "video/mascot-legal-story.mp4"], check=True)
print("FINAL VIDEO DONE", flush=True)
