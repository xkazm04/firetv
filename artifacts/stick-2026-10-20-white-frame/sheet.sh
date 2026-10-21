# sheet.sh <video> <out.jpg>: every frame of a capture, 10 per row
ffmpeg -v error -y -i "$1" -vsync 0 -vf "setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709,scale=192:108,tile=10x12:padding=2" -frames:v 1 "$2"
