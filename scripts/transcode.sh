#!/usr/bin/env bash
set -euo pipefail

INPUT="${1:-public/video.mp4}"
OUTPUT_DIR="public/hls"

if [ ! -f "$INPUT" ]; then
  echo "Input file not found: $INPUT"
  echo "Usage: $0 [path-to-video.mp4]"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

ffmpeg -i "$INPUT" \
  -preset fast -g 48 -sc_threshold 0 \
  \
  -map v:0 -c:v:0 libx264 -b:v:0 5000k -maxrate:v:0 5350k -bufsize:v:0 7500k \
  -filter:v:0 "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  \
  -map v:0 -c:v:1 libx264 -b:v:1 2500k -maxrate:v:1 2675k -bufsize:v:1 3750k \
  -filter:v:1 "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
  \
  -map v:0 -c:v:2 libx264 -b:v:2 1000k -maxrate:v:2 1075k -bufsize:v:2 1500k \
  -filter:v:2 "scale=854:480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2" \
  \
  -map v:0 -c:v:3 libx264 -b:v:3 500k -maxrate:v:3 535k -bufsize:v:3 750k \
  -filter:v:3 "scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2" \
  \
  -map a:0 -c:a aac -b:a 128k -ac 2 \
  -map a:0 -c:a aac -b:a 96k -ac 2 \
  -map a:0 -c:a aac -b:a 64k -ac 2 \
  -map a:0 -c:a aac -b:a 48k -ac 2 \
  \
  -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p v:3,a:3,name:360p" \
  \
  -f hls -hls_time 4 -hls_playlist_type vod \
  -hls_segment_filename "$OUTPUT_DIR/%v/segment_%03d.ts" \
  -master_pl_name "master.m3u8" \
  "$OUTPUT_DIR/%v/index.m3u8"

echo "Done — HLS segments written to $OUTPUT_DIR/"
