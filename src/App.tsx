import { VideoPlayer } from './components/VideoPlayer'

function App() {
  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <h1>Video Player</h1>
      <VideoPlayer src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
    </main>
  )
}

export default App
