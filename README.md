# React Video Player

Adaptive bitrate video player built with React 19, TypeScript, and hls.js.

## Features

- **Adaptive bitrate streaming** via HLS — auto-switches quality as network conditions change
- **Play/Pause** — click video or controls
- **Skip ±10s** — backward and forward
- **Speed control** — cycles through 0.25×–2×
- **Infinite loop** — toggles restart on end
- **Keyboard shortcuts** — <kbd>Space</kbd> play/pause, <kbd>←</kbd>/<kbd>→</kbd> skip, <kbd>↑</kbd>/<kbd>↓</kbd> speed
- **Overlay controls** — fade in on hover, stay visible when paused
- **Quality badge** — shows current adaptive level (e.g. `720p`)
- **Loading / buffering / error states**

## Tech stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev) | UI framework (`use`, ref as prop, actions) |
| [React Compiler](https://react.dev/learn/react-compiler) | Automatic memoization at build time |
| [TypeScript](https://www.typescriptlang.org) | Strict type safety |
| [Vite 8](https://vite.dev) | Build tool with Oxc transform |
| [hls.js](https://github.com/video-dev/hls.js) | Client-side HLS playback with ABR |
| [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) | Unit / integration tests |
| [FFmpeg](https://ffmpeg.org) | Multi-quality video transcoding |

## Getting started

```bash
pnpm install
```

Place a video at `public/video.mp4` (or update the path in `scripts/transcode.sh`).

Transcode it into HLS segments:

```bash
pnpm transcode
```

Start the dev server:

```bash
pnpm dev
```

Open `http://localhost:5173` — the player loads `/hls/master.m3u8`.

## Simulating adaptive quality

1. Open Chrome DevTools → **Network** tab
2. Set throttling to **Slow 3G** or **Fast 3G**
3. The quality badge in the controls updates as hls.js adapts to bandwidth
4. Switch back to **Online** to see it scale back up

## Project structure

```
src/
├── components/
│   ├── VideoPlayer.tsx          # Player UI with overlay controls
│   ├── VideoPlayer.css          # Styles
│   └── VideoPlayer.test.tsx     # 18 tests
├── hooks/
│   ├── useVideoPlayer.ts        # Playback state, speed, skip, loop, keyboard
│   └── useHLS.ts                # hls.js lifecycle (code-split via dynamic import)
├── test/
│   ├── mocks.ts                 # HTMLVideoElement mock for jsdom
│   └── setup.ts                 # jest-dom matchers
└── types/
    └── index.ts                 # Shared types
scripts/
└── transcode.sh                 # FFmpeg → 1080p/720p/480p/360p HLS
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | TypeScript check + production build |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm transcode` | Transcode video into HLS segments |
| `pnpm lint` | ESLint check |
| `pnpm preview` | Preview production build |

## Git history

```
8f89fc8  Code-split hls.js via dynamic import
bd2737c  Add HLS adaptive bitrate streaming with code quality improvements
ce0a3a3  Integrate React Compiler 1.0
e8194b1  Add React Testing Library tests
3f80601  Initialize project with Vite + React 19 + TypeScript
```
