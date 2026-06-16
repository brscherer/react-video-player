import { useRef, useState } from 'react'
import type { PlaybackSpeed } from '../types'

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)

  function togglePlay() {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  function changeSpeed(newSpeed: PlaybackSpeed) {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = newSpeed
    setSpeed(newSpeed)
  }

  function skip(seconds: number) {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(
      0,
      Math.min(video.currentTime + seconds, video.duration || Infinity),
    )
  }

  return {
    videoRef,
    isPlaying,
    speed,
    setIsPlaying,
    togglePlay,
    changeSpeed,
    skip,
  }
}
