import { useRef, useState, useEffect } from 'react'
import Hls from 'hls.js'
import type { QualityLevel } from '../types'

interface HLSState {
  levels: QualityLevel[]
  currentLevel: number | null
  isLoading: boolean
  error: string | null
}

const INITIAL_STATE: HLSState = {
  levels: [],
  currentLevel: null,
  isLoading: true,
  error: null,
}
export function useHLS(videoRef: React.RefObject<HTMLVideoElement | null>, src: string) {
  const hlsRef = useRef<Hls | null>(null)
  const [state, setState] = useState<HLSState>(() => {
    if (src.endsWith('.m3u8') && !Hls.isSupported()) {
      return { ...INITIAL_STATE, isLoading: false, error: 'HLS streaming is not supported in this browser' }
    }
    if (!src.endsWith('.m3u8')) {
      return { ...INITIAL_STATE, isLoading: false }
    }
    return INITIAL_STATE
  })

  useEffect(() => {
    if (!src.endsWith('.m3u8') || !Hls.isSupported()) return

    const video = videoRef.current
    if (!video) return

    const hls = new Hls({
      enableWorker: true,
      startLevel: -1,
      capLevelToPlayerSize: true,
    })

    hls.attachMedia(video)
    hls.loadSource(src)

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      setState({
        levels: data.levels.map((l) => ({
          height: l.height,
          bitrate: l.bitrate,
          name: l.name || `${l.height}p`,
        })),
        currentLevel: hls?.currentLevel ?? null,
        isLoading: false,
        error: null,
      })
    })

    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      setState((prev) => ({
        ...prev,
        currentLevel: data.level,
      }))
    })

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        setState((prev) => ({
          ...prev,
          error: `Playback error: ${data.type}`,
        }))
        hls.destroy()
        hlsRef.current = null
      }
    })

    hls.on(Hls.Events.BUFFER_APPENDING, () => {
      setState((prev) => ({ ...prev, error: null }))
    })

    hlsRef.current = hls

    return () => {
      hls.destroy()
      hlsRef.current = null
    }
  }, [videoRef, src])

  return state
}
