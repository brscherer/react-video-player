import { VideoPlayer } from './components/VideoPlayer'

function App() {
  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <h1>Video Player</h1>
      <VideoPlayer src="/video.mp4" />
    </main>
  )
}

export default App
