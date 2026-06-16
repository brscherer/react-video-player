export function mockHTMLVideoElement() {
  let paused = true
  let playbackRate = 1
  let currentTime = 0
  const duration = 120

  const play = vi.fn(async () => {
    paused = false
  })

  const pause = vi.fn(() => {
    paused = true
  })

  Object.defineProperty(HTMLVideoElement.prototype, 'paused', {
    get: () => paused,
    configurable: true,
  })

  Object.defineProperty(HTMLVideoElement.prototype, 'playbackRate', {
    get: () => playbackRate,
    set: (v: number) => { playbackRate = v },
    configurable: true,
  })

  Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
    get: () => currentTime,
    set: (v: number) => { currentTime = v },
    configurable: true,
  })

  Object.defineProperty(HTMLVideoElement.prototype, 'duration', {
    get: () => duration,
    configurable: true,
  })

  HTMLVideoElement.prototype.play = play
  HTMLVideoElement.prototype.pause = pause

  return { play, pause, getCurrentTime: () => currentTime, getPaused: () => paused }
}
