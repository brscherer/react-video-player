import { useState, useCallback, useEffect, useRef } from 'react'
import type { PlaybackSpeed } from '../types'

export function useVideoPlayer(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const [loop, setLoop] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const speedRef = useRef(speed)
  useEffect(() => {
    speedRef.current = speed
  })

  const togglePlay = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (video.paused) {
        await video.play()
        setIsPlaying(true)
        setError(null)
      } else {
        video.pause()
        setIsPlaying(false)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('Playback was prevented. Please interact with the page first.')
    }
  }, [videoRef])

  const changeSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = newSpeed
    setSpeed(newSpeed)
  }, [videoRef])

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return

    // eslint-disable-next-line react-compiler/react-compiler -- intentional DOM mutation in event handler
    video.currentTime = Math.max(
      0,
      Math.min(video.currentTime + seconds, video.duration || Infinity),
    )
  }, [videoRef])

  const toggleLoop = useCallback(() => {
    setLoop((prev) => !prev)
  }, [])

  const handleEnded = useCallback(() => {
    if (!speedRef.current) return
    if (!loop) {
      setIsPlaying(false)
      return
    }
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    video.play().catch(() => {})
  }, [loop, videoRef])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

    switch (event.key) {
      case ' ':
        event.preventDefault()
        togglePlay()
        break
      case 'ArrowLeft':
        event.preventDefault()
        skip(-10)
        break
      case 'ArrowRight':
        event.preventDefault()
        skip(10)
        break
      case 'ArrowUp':
        event.preventDefault()
        changeSpeed(
          Math.min(speedRef.current + 0.25, 2) as PlaybackSpeed,
        )
        break
      case 'ArrowDown':
        event.preventDefault()
        changeSpeed(
          Math.max(speedRef.current - 0.25, 0.25) as PlaybackSpeed,
        )
        break
    }
  }, [togglePlay, skip, changeSpeed])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function onWaiting() {
      setIsBuffering(true)
    }

    function onCanPlay() {
      setIsBuffering(false)
      setError(null)
    }

    function onError() {
      const el = videoRef.current
      const mediaError = el?.error
      if (mediaError) {
        setError(`Video error: ${mediaError.message || 'Unknown error'}`)
      }
      setIsPlaying(false)
    }

    video.addEventListener('waiting', onWaiting)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('error', onError)

    return () => {
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onError)
    }
  }, [videoRef])

  return {
    isPlaying,
    speed,
    loop,
    isBuffering,
    error,
    setError,
    togglePlay,
    changeSpeed,
    skip,
    toggleLoop,
    handleEnded,
    handleKeyDown,
  }
}
