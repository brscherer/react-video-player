import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VideoPlayer } from './VideoPlayer'
import { mockHTMLVideoElement } from '../test/mocks'

const SAMPLE_SRC = 'https://example.com/video.mp4'

beforeEach(() => {
  mockHTMLVideoElement()
})

describe('VideoPlayer', () => {
  it('renders video element with src', () => {
    render(<VideoPlayer src={SAMPLE_SRC} />)
    const video = screen.getByTestId('video-element') as HTMLVideoElement
    expect(video).toBeInTheDocument()
    expect(video.src).toContain(SAMPLE_SRC)
  })

  it('renders play/pause, speed, and skip buttons', () => {
    render(<VideoPlayer src={SAMPLE_SRC} />)
    expect(screen.getByLabelText('Play')).toBeInTheDocument()
    expect(screen.getByLabelText('Rewind 10 seconds')).toBeInTheDocument()
    expect(screen.getByLabelText('Forward 10 seconds')).toBeInTheDocument()
  })

  it('toggles between play and pause', async () => {
    const user = userEvent.setup()
    render(<VideoPlayer src={SAMPLE_SRC} />)

    const playBtn = screen.getByLabelText('Play')
    await user.click(playBtn)
    expect(screen.getByLabelText('Pause')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Pause'))
    expect(screen.getByLabelText('Play')).toBeInTheDocument()
  })

  it('changes speed on cycle button click', async () => {
    const user = userEvent.setup()
    render(<VideoPlayer src={SAMPLE_SRC} />)

    const speedBtn = screen.getByLabelText(/speed/i)
    expect(speedBtn).toHaveTextContent('1x')

    await user.click(speedBtn)
    expect(speedBtn).toHaveTextContent('1.25x')

    await user.click(speedBtn)
    expect(speedBtn).toHaveTextContent('1.5x')
  })

  it('calls skip forward on +10s button', async () => {
    const user = userEvent.setup()
    render(<VideoPlayer src={SAMPLE_SRC} />)

    const video = screen.getByTestId('video-element') as HTMLVideoElement
    video.currentTime = 50

    await user.click(screen.getByLabelText('Forward 10 seconds'))
    expect(video.currentTime).toBe(60)
  })

  it('calls skip backward on -10s button', async () => {
    const user = userEvent.setup()
    render(<VideoPlayer src={SAMPLE_SRC} />)

    const video = screen.getByTestId('video-element') as HTMLVideoElement
    video.currentTime = 50

    await user.click(screen.getByLabelText('Rewind 10 seconds'))
    expect(video.currentTime).toBe(40)
  })

  it('clamps skip backward to 0', async () => {
    const user = userEvent.setup()
    render(<VideoPlayer src={SAMPLE_SRC} />)

    const video = screen.getByTestId('video-element') as HTMLVideoElement
    video.currentTime = 5

    await user.click(screen.getByLabelText('Rewind 10 seconds'))
    expect(video.currentTime).toBe(0)
  })

  it('passes className to container', () => {
    const { container } = render(<VideoPlayer src={SAMPLE_SRC} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
