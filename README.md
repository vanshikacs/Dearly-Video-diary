<div align="center">

<br />

# 🕊️ Dearly

### *A gentle place for your memories*

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-dearly.vercel.app-C84B5C?style=for-the-badge&logoColor=white)](https://dearlywithlove-delta.vercel.app/)
[![Made with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-F4C7C3?style=for-the-badge)](LICENSE)

<br />

> Dearly is a private, slow, thoughtful video journal.  
> It feels less like an app and more like a quiet corner you trust.

<br />

</div>

---

## What is Dearly?

Most apps want your attention. Dearly just wants to hold your memories.

You record short video moments — a morning, a walk, a feeling — write a few words alongside them, choose how today feels, and let Dearly keep them safe. At the end of a month, it writes you a letter about the time that passed. You can write letters to your future self. You can generate soft, music-backed reels from your older memories.

Everything stays on your device. Nothing is uploaded. Nothing is sold. Nobody sees it but you.

---

## Features

### 🎥 Capture softly
Record video memories directly in the browser. Write alongside your video with a gentle "Dearly," prompt. Choose how today feels — not a mood tracker, a feeling observer — from options like peaceful, warm, nostalgic, tender, quiet, hopeful.

### 🌿 Reflections
Soft observations about your patterns, generated from your captures. No metrics, no scores, no percentages. Just gentle noticing — time-of-day patterns, emotional consistency, streaks, quiet shifts over time — written in human language.

### ✉️ Letters to self
Write to future you. Schedule delivery one month, three months, one year, or any custom date from now. The letter waits, sealed. When the date arrives, an envelope appears. You open it.

### 📖 Monthly letters
At the end of each month, Dearly writes you a narrative letter about the time that passed. Not a summary, not a chart — a letter. It notices your dominant feeling, the time of day you tended to write, whether something shifted from the start to the end of the month.

### 🎞️ Moments (video reels)
Automatically generates a short multi-clip reel from your memories — trimmed, Ken Burns zoomed, soft crossfade transitions, date and feeling overlays, and background music. Built on the Canvas API and Web Audio API. No external services. Fully private. Downloadable.

### 🎨 Profile & personalization
Choose your visual theme (Blush, Dusk, Forest, Parchment, Midnight). Set your mood identity. Pick a music vibe and energy level. Preview built-in ambient tracks before setting them as default. Upload your own music. All reel generation — aspect ratio, clip length, transitions, overlay style — follows your profile.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Storage | IndexedDB via `idb` |
| Video processing | Canvas API + MediaRecorder |
| Audio | Web Audio API (procedural synthesis + uploaded files) |
| Deployment | Vercel / Netlify (static) |

No backend. No database. No API keys. No accounts.

---

## Getting started

```bash
# Clone the repository
git clone https://github.com/vanshikacs/Dearly-Video-diary.git
cd Dearly-Video-diary

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
npm run preview   # test the production build locally at localhost:4173
```

Deploy the `dist/` folder to any static host.

---

## Deployment

### Vercel (recommended)

Push to GitHub, then:

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework preset: **Vite** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Environment variables: **leave blank**
7. Click **Deploy**

The `vercel.json` in the root handles SPA routing so `/reflections`, `/letters`, etc. work on direct visit and refresh.

### Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site**
2. Connect GitHub, select the repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Deploy**

The `public/_redirects` file handles SPA routing for Netlify.

### No environment variables required

Dearly has no backend, no API keys, and no external services. Leave the environment variables section completely empty on any host.

---

## Project structure

```
dearly/
├── public/
│   ├── _redirects              ← Netlify SPA routing
│   └── dearly-icon.png
├── src/
│   ├── main.jsx
│   ├── App.jsx                 ← routes + navigation
│   ├── index.css               ← Tailwind + custom design system
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── CaptureComponent.jsx
│   │   ├── FloatingDoodle.jsx
│   │   ├── GallerySection.jsx
│   │   ├── CloudDividerSection.jsx
│   │   ├── ReflectionsPanel.jsx
│   │   ├── LettersToSelf.jsx
│   │   ├── MonthlyLettersViewer.jsx
│   │   ├── MomentsViewer.jsx
│   │   └── ProfilePanel.jsx
│   ├── pages/
│   │   └── Home.jsx
│   └── utils/
│       ├── db.js               ← IndexedDB (captures, moments, letters, profile)
│       ├── audioEngine.js      ← Web Audio synthesis + reel music mixing
│       ├── videoProcessor.js   ← Canvas trimming, stitching, overlays
│       ├── momentGenerator.js  ← Multi-clip reel generation pipeline
│       ├── reflectionsAnalyzer.js
│       ├── monthlyLetterGenerator.js
│       └── profileStore.js
├── vercel.json                 ← Vercel SPA routing
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## How the reel generation works

When you generate a Moment, this is what happens inside your browser:

1. All captures with video blobs are loaded from IndexedDB
2. Clips are selected based on your chosen theme (older, peaceful, recent) and your profile's mood identity
3. Each selected clip is trimmed to your preferred clip length, starting 33% into the source to avoid dead-start frames
4. Ken Burns zoom is applied to each clip via the Canvas API
5. An audio buffer is resolved — from your uploaded music file (decoded via `decodeAudioData`) or from a procedurally synthesized built-in track (rendered via `OfflineAudioContext`)
6. All clips are stitched sequentially on a single canvas with crossfade transitions, and the audio track is mixed in as a separate `MediaStream` track
7. `MediaRecorder` captures the combined video + audio stream
8. The final `.webm` file is saved to IndexedDB and offered for download

Nothing leaves your device at any point.

---

## Browser support

| Browser | Recording | Moments | Music |
|---|---|---|---|
| Chrome / Edge (desktop) | ✅ | ✅ | ✅ |
| Firefox (desktop) | ✅ | ✅ | ✅ |
| Safari 15+ (desktop) | ✅ | ✅ | ✅ |
| Chrome (Android) | ✅ | ✅ | ✅ |
| Safari (iOS 15+) | ⚠️ partial | ⚠️ partial | ✅ |

Camera access requires HTTPS. Both Vercel and Netlify serve over HTTPS automatically.

---

## Privacy

Dearly was designed from the start to be completely private.

- All data is stored in your browser's IndexedDB — no servers, no cloud
- Video blobs, letters, moments, and your profile never leave your device
- There are no analytics, no tracking, no cookies
- If you clear your browser storage, your data is gone — there is no backup
- Different devices and browsers have completely separate data

This is a deliberate choice. Your memories are not a product.

---

## Design philosophy

**This should not feel like an app.**

It should feel like a quiet corner. A warm café. A notebook you trust.

Every word in Dearly was chosen carefully:

| ❌ Don't say | ✅ Dearly says |
|---|---|
| Record entry | Capture softly |
| Start recording | Begin |
| Stop recording | Pause |
| Save entry | Keep this |
| Journal | Letters |
| Insights | Reflections |
| Memory Reel | Moments |
| Mood picker | How does today feel? |
| Empty state message | Nothing here yet. That's okay. |

Speed implies urgency. Dearly should feel unrushed. Animations breathe rather than snap. Nothing bounces. The UI never demands your attention.

---

## Why "Dearly"?

It's how you'd start a letter to someone you care about. In this case, that someone is future you.

---

## Contributing

Dearly is a personal project built with care. If something is broken, open an issue. If you have a gentle idea that fits the spirit of the app, a pull request is welcome.

Please read the design philosophy section before contributing. Features that add urgency, metrics, social elements, or cloud sync are unlikely to be a fit — not because they're bad ideas, but because they'd change what this space is.

---

## License

MIT — do what you like with it, but keep it gentle.

---

<div align="center">

<br />

*Built with care, slowness, and attention to softness.*

<br />

**Dearly — a gentle place for your memories**

<br />

</div>