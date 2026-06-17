import { VideoPlayer } from './components/VideoPlayer'

function App() {
  return (
    <main style={{ padding: '32px 16px' }}>
      <h1 style={{ marginBottom: 24, fontSize: 22 }}>Video Player</h1>
      <VideoPlayer src="/hls/master.m3u8" />
    </main>
  )
}

export default App
