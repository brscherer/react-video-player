import { useRef, useEffect, useCallback } from 'react'
import type { PlaybackSpeed } from '../types'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { useHLS } from '../hooks/useHLS'
import './VideoPlayer.css'

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

interface VideoPlayerProps {
  src: string
  className?: string
}

export function VideoPlayer({ src, className }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const {
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
  } = useVideoPlayer(videoRef)

  const hlsState = useHLS(videoRef, src)

  const currentSpeedIndex = SPEEDS.indexOf(speed)
  const nextSpeed = SPEEDS[(currentSpeedIndex + 1) % SPEEDS.length]

  const cycleSpeed = useCallback(() => changeSpeed(nextSpeed), [changeSpeed, nextSpeed])

  const currentLevel = hlsState.currentLevel !== null ? hlsState.levels[hlsState.currentLevel] : null

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const isLoading = hlsState.isLoading && src.endsWith('.m3u8')
  const displayError = error || hlsState.error

  return (
    <div
      ref={containerRef}
      className={['video-player', !isPlaying && 'paused', className]
        .filter(Boolean)
        .join(' ')}
      tabIndex={0}
      role="application"
      aria-label="Video Player"
    >
      <video
        ref={videoRef}
        src={!src.endsWith('.m3u8') ? src : undefined}
        data-testid="video-element"
        onClick={togglePlay}
        onEnded={handleEnded}
        onError={() => setError('Failed to load video')}
        preload="metadata"
      />

      {isLoading && (
        <div className="overlay" aria-label="Loading video">
          <div className="spinner" />
        </div>
      )}

      {displayError && (
        <div className="overlay error-overlay">
          <p>{displayError}</p>
          <button type="button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {isBuffering && isPlaying && (
        <div className="buffering-indicator" aria-label="Buffering">
          <div className="spinner" />
        </div>
      )}

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

        {currentLevel && (
          <span className="quality-badge" aria-label={`Current quality: ${currentLevel.name}`}>
            {currentLevel.name}
          </span>
        )}

        <button
          type="button"
          onClick={toggleLoop}
          aria-label={loop ? 'Disable loop' : 'Enable loop'}
          className={loop ? 'active' : ''}
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
