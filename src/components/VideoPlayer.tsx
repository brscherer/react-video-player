import { useCallback } from 'react'
import type { PlaybackSpeed } from '../types'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import './VideoPlayer.css'

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

interface VideoPlayerProps {
  src: string
  className?: string
}

export function VideoPlayer({ src, className }: VideoPlayerProps) {
  const {
    videoRef,
    isPlaying,
    speed,
    loop,
    togglePlay,
    changeSpeed,
    skip,
    toggleLoop,
    handleEnded,
  } = useVideoPlayer()

  const currentSpeedIndex = SPEEDS.indexOf(speed)
  const nextSpeed = SPEEDS[(currentSpeedIndex + 1) % SPEEDS.length]

  const cycleSpeed = useCallback(() => changeSpeed(nextSpeed), [changeSpeed, nextSpeed])

  return (
    <div
      className={['video-player', !isPlaying && 'paused', className].filter(Boolean).join(' ')}
    >
      <video
        ref={videoRef}
        src={src}
        data-testid="video-element"
        onClick={togglePlay}
        onEnded={handleEnded}
      />

      <div className="controls">
        <button type="button" onClick={() => skip(-10)} aria-label="Rewind 10 seconds">
          -10s
        </button>

        <button
          type="button"
          className="play-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button type="button" onClick={() => skip(10)} aria-label="Forward 10 seconds">
          +10s
        </button>

        <span className="spacer" />

        <button
          type="button"
          onClick={toggleLoop}
          aria-label={loop ? 'Disable loop' : 'Enable loop'}
          style={{ opacity: loop ? 1 : 0.5 }}
        >
          Loop
        </button>

        <button type="button" onClick={cycleSpeed} aria-label={`Speed: ${nextSpeed}x`}>
          {speed}x
        </button>
      </div>
    </div>
  )
}
