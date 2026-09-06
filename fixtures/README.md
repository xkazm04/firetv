# Fixtures

The PoC clip is generated, not committed, so the repo stays free of binary churn and of any
question about footage rights. Regenerate it with:

```bash
ffmpeg -y \
  -f lavfi -i "testsrc2=size=1280x720:rate=25:duration=20" \
  -vf "drawbox=x='mod(t*140\,1180)':y='360+220*sin(t*2)':w=90:h=90:color=orange@0.95:t=fill" \
  -c:v libx264 -pix_fmt yuv420p -profile:v baseline -level 3.1 -g 25 \
  ../tv-app/src/main/res/raw/fixture_clip.mp4
```

A synthetic pattern is a deliberate choice for the automated tests: every frame is deterministic,
so pixel assertions have a stable baseline. Real footage belongs here once there is a clip we own
or that is CC-licensed (design doc §9).
