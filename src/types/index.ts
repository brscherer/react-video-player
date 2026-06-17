export interface VideoPlayerProps {
  src: string
  className?: string
}

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2

export interface QualityLevel {
  height: number
  bitrate: number
  name: string
}

export type PlayerState = 'loading' | 'ready' | 'playing' | 'paused' | 'error'

export interface HLSConfig {
  enableWorker: boolean
  startLevel: number
  capLevelToPlayerSize: boolean
}
