import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VideoPlayer } from './VideoPlayer'
import { mockHTMLVideoElement } from '../test/mocks'

const MP4_SRC = '/video.mp4'
const HLS_SRC = '/hls/master.m3u8'

beforeEach(() => {
  mockHTMLVideoElement()
})

describe('VideoPlayer', () => {
  it('renders video element and controls', () => {
    render(<VideoPlayer src={MP4_SRC} />)
    expect(screen.getByTestId('video-element')).toBeInTheDocument()
    expect(screen.getByLabelText('Play')).toBeInTheDocument()
    expect(screen.getByLabelText('Rewind 10 seconds')).toBeInTheDocument()
    expect(screen.getByLabelText('Forward 10 seconds')).toBeInTheDocument()
    expect(screen.getByLabelText('Enable loop')).toBeInTheDocument()
  })

  it('sets video src for non-HLS sources', () => {
    render(<VideoPlayer src={MP4_SRC} />)
    const video = screen.getByTestId('video-element') as HTMLVideoElement
    expect(video.src).toContain(MP4_SRC)
  })

  it('does not set video src for HLS sources', () => {
    render(<VideoPlayer src={HLS_SRC} />)
    const video = screen.getByTestId('video-element') as HTMLVideoElement
    expect(video.src).toBe('')
  })

  it('has focusable container with application role', () => {
    render(<VideoPlayer src={MP4_SRC} />)
    const container = screen.getByRole('application')
    expect(container).toHaveAttribute('tabindex', '0')
  })

  describe('playback controls', () => {
    it('toggles between play and pause', async () => {
      const user = userEvent.setup()
      render(<VideoPlayer src={MP4_SRC} />)

      await user.click(screen.getByLabelText('Play'))
      expect(screen.getByLabelText('Pause')).toBeInTheDocument()

      await user.click(screen.getByLabelText('Pause'))
      expect(screen.getByLabelText('Play')).toBeInTheDocument()
    })

    it('changes speed on cycle button click', async () => {
      const user = userEvent.setup()
      render(<VideoPlayer src={MP4_SRC} />)

      const speedBtn = screen.getByLabelText(/speed/i)
      expect(speedBtn).toHaveTextContent('1x')

      await user.click(speedBtn)
      expect(speedBtn).toHaveTextContent('1.25x')

      await user.click(speedBtn)
      expect(speedBtn).toHaveTextContent('1.5x')
    })

    it('skips forward 10 seconds', async () => {
      const user = userEvent.setup()
      render(<VideoPlayer src={MP4_SRC} />)

      const video = screen.getByTestId('video-element') as HTMLVideoElement
      video.currentTime = 50

      await user.click(screen.getByLabelText('Forward 10 seconds'))
      expect(video.currentTime).toBe(60)
    })

    it('skips backward 10 seconds', async () => {
      const user = userEvent.setup()
      render(<VideoPlayer src={MP4_SRC} />)

      const video = screen.getByTestId('video-element') as HTMLVideoElement
      video.currentTime = 50

      await user.click(screen.getByLabelText('Rewind 10 seconds'))
      expect(video.currentTime).toBe(40)
    })

    it('clamps skip backward to 0', async () => {
      const user = userEvent.setup()
      render(<VideoPlayer src={MP4_SRC} />)

      const video = screen.getByTestId('video-element') as HTMLVideoElement
      video.currentTime = 5

      await user.click(screen.getByLabelText('Rewind 10 seconds'))
      expect(video.currentTime).toBe(0)
    })
  })

  describe('loop', () => {
    it('renders loop button and toggles', async () => {
      const user = userEvent.setup()
      render(<VideoPlayer src={MP4_SRC} />)

      const loopBtn = screen.getByLabelText('Enable loop')
      await user.click(loopBtn)
      expect(screen.getByLabelText('Disable loop')).toBeInTheDocument()
    })

    it('restarts video on ended when loop is enabled', async () => {
      const user = userEvent.setup()
      render(<VideoPlayer src={MP4_SRC} />)

      const video = screen.getByTestId('video-element') as HTMLVideoElement
      const playSpy = vi.spyOn(video, 'play')

      await user.click(screen.getByLabelText('Enable loop'))
      video.currentTime = 90
      video.dispatchEvent(new Event('ended'))

      expect(video.currentTime).toBe(0)
      expect(playSpy).toHaveBeenCalled()
    })

    it('shows paused state on ended when loop is disabled', async () => {
      render(<VideoPlayer src={MP4_SRC} />)

      const video = screen.getByTestId('video-element') as HTMLVideoElement
      video.dispatchEvent(new Event('ended'))

      expect(screen.getByLabelText('Play')).toBeInTheDocument()
    })
  })

  describe('keyboard shortcuts', () => {
    it('toggles play/pause on Space', async () => {
      render(<VideoPlayer src={MP4_SRC} />)
      const container = screen.getByRole('application')

      act(() => {
        container.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
      })

      await waitFor(() => {
        expect(screen.getByLabelText('Pause')).toBeInTheDocument()
      })

      act(() => {
        container.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
      })

      await waitFor(() => {
        expect(screen.getByLabelText('Play')).toBeInTheDocument()
      })
    })

    it('skips forward on ArrowRight', async () => {
      render(<VideoPlayer src={MP4_SRC} />)

      const video = screen.getByTestId('video-element') as HTMLVideoElement
      video.currentTime = 50

      act(() => {
        screen.getByRole('application').dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight' }),
        )
      })

      expect(video.currentTime).toBe(60)
    })

    it('skips backward on ArrowLeft', async () => {
      render(<VideoPlayer src={MP4_SRC} />)

      const video = screen.getByTestId('video-element') as HTMLVideoElement
      video.currentTime = 50

      act(() => {
        screen.getByRole('application').dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowLeft' }),
        )
      })

      expect(video.currentTime).toBe(40)
    })
  })

  describe('error handling', () => {
    it('displays error overlay on video error', async () => {
      render(<VideoPlayer src={MP4_SRC} />)

      const video = screen.getByTestId('video-element') as HTMLVideoElement
      act(() => {
        video.dispatchEvent(new Event('error', { bubbles: true }))
      })

      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
      })
    })

    it('dismisses error overlay', async () => {
      const user = userEvent.setup()
      render(<VideoPlayer src={MP4_SRC} />)

      const video = screen.getByTestId('video-element') as HTMLVideoElement
      act(() => {
        video.dispatchEvent(new Event('error', { bubbles: true }))
      })

      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
      })

      await user.click(screen.getByText('Dismiss'))
      expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('passes className to container', () => {
      const { container } = render(<VideoPlayer src={MP4_SRC} className="custom" />)
      expect(container.firstChild).toHaveClass('custom')
    })
  })
})
