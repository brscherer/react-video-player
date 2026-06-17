import { useRef, useState, useEffect } from 'react'
import type HlsType from 'hls.js'
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

let HlsClass: typeof HlsType | null = null
let hlsSupported: boolean | null = null

async function getHls() {
  if (hlsSupported !== null) return hlsSupported
  try {
    const mod = await import('hls.js')
    HlsClass = mod.default
    hlsSupported = HlsClass.isSupported()
    return hlsSupported
  } catch {
    hlsSupported = false
    return false
  }
}

export function useHLS(videoRef: React.RefObject<HTMLVideoElement | null>, src: string) {
  const hlsRef = useRef<HlsType | null>(null)
  const [state, setState] = useState<HLSState>(() => {
    if (!src.endsWith('.m3u8')) {
      return { ...INITIAL_STATE, isLoading: false }
    }
    if (hlsSupported === false) {
      return { ...INITIAL_STATE, isLoading: false, error: 'HLS streaming is not supported in this browser' }
    }
    return INITIAL_STATE
  })

  useEffect(() => {
    if (!src.endsWith('.m3u8')) return

    let cancelled = false

    async function initHls() {
      const supported = await getHls()
      if (cancelled) return
      if (!supported || !HlsClass) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'HLS streaming is not supported in this browser',
        }))
        return
      }

      const video = videoRef.current
      if (!video) return

      const hls = new HlsClass({
        enableWorker: true,
        startLevel: -1,
        capLevelToPlayerSize: true,
      })

      hls.attachMedia(video)
      hls.loadSource(src)

      hls.on(HlsClass.Events.MANIFEST_PARSED, (_, data) => {
        if (cancelled) return
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

      hls.on(HlsClass.Events.LEVEL_SWITCHED, (_, data) => {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          currentLevel: data.level,
        }))
      })

      hls.on(HlsClass.Events.ERROR, (_, data) => {
        if (cancelled) return
        if (data.fatal) {
          setState((prev) => ({
            ...prev,
            error: `Playback error: ${data.type}`,
          }))
          hls.destroy()
          hlsRef.current = null
        }
      })

      hls.on(HlsClass.Events.BUFFER_APPENDING, () => {
        if (cancelled) return
        setState((prev) => ({ ...prev, error: null }))
      })

      hlsRef.current = hls
    }

    initHls()

    return () => {
      cancelled = true
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [videoRef, src])

  return state
}
