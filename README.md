# 🕊️ Dearly

> A gentle place for your memories

Dearly is a private, slow, thoughtful video journal that feels less like an app and more like a quiet corner you trust.

---

## ✨ Features

### 🎥 Capture Softly
- Record video memories with gentle prompts
- Write alongside your videos with "Dearly," prefix
- Choose how today feels (not a mood tracker—a feeling observer)

### 🌿 Reflections
- Soft observations about your patterns
- No metrics, no scores—just gentle noticing
- Written in human language, not analytics

### ✉️ Letters to Self
- Write to future you
- Schedule delivery (1 month, 1 year, custom)
- Envelope-style UI with opening animation
- "A letter you once wrote, for today"

### 📖 Monthly Letters
- Narrative letters generated at month's end
- Emotional themes, not data
- No charts—just a letter written to you, about your month

### 🎞️ Moments (Real Video Reels)
- Auto-generate 5-10 second video montages
- Uses **real FFmpeg.js** processing
- Soft cross-fades, Ken Burns zoom, date overlays
- Downloadable as MP4

---

## 🛠️ Tech Stack

- **React 18** + **Vite**
- **Framer Motion** (slow, breathing animations)
- **FFmpeg.js** (real video processing—not placeholders)
- **IndexedDB** (private, on-device storage)
- **Tailwind CSS** (custom Dearly aesthetic)

---

## 📦 Installation

```bash
# Clone or download the project
cd dearly

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run at `http://localhost:3000`

---

## 📁 Complete File Structure

```
dearly/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── doodles/
│       ├── star.svg
│       ├── donut.svg
│       └── cloud.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Hero.jsx
    │   ├── CaptureComponent.jsx
    │   ├── FloatingDoodle.jsx
    │   ├── GallerySection.jsx
    │   ├── CloudDividerSection.jsx
    │   ├── ReflectionsPanel.jsx
    │   ├── LettersToSelf.jsx
    │   ├── MonthlyLettersViewer.jsx
    │   └── MomentsViewer.jsx
    ├── pages/
    │   └── Home.jsx
    └── utils/
        ├── db.js
        ├── reflectionsAnalyzer.js
        ├── monthlyLetterGenerator.js
        ├── videoProcessor.js (FFmpeg)
        └── momentGenerator.js
```

---

## 🎨 Design Philosophy

**This should not feel like an app.**

It should feel like:
- A quiet corner
- A warm café
- A notebook you trust

### Key Principles
- **Slow everything down** — No bounce, no snap, breathing animations only
- **Soft language** — "Capture softly" not "Record entry"
- **No judgment** — Reflections observe, they don't analyze
- **Private by default** — Everything stays on your device
- **Human-written copy** — Never product language

---

## 🌙 Micro-Copy System

Always use these phrases:

| ❌ Don't Say | ✅ Say |
|-------------|--------|
| Record entry | Capture softly |
| Start recording | Begin |
| Stop recording | Pause |
| Save entry | Keep this |
| Journal | Letters |
| Insights | Reflections |
| Memory Reel | Moments |
| Mood picker | How does today feel? |
| Empty state | Nothing here yet. That's okay. |

---

## 🎥 Real Video Processing

**Moments** uses **real FFmpeg.js** to generate video reels:

1. Loads FFmpeg WebAssembly module (first time only)
2. Selects 5-10 older memories
3. Trims each to 5 seconds
4. Applies Ken Burns zoom effect
5. Adds date + feeling overlays
6. Stitches with cross-fade transitions
7. Exports as downloadable MP4

**This is not a mock—it actually processes videos.**

---

## 🚀 Building for Production

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, etc.)

---

## 💭 Philosophy Notes

### Why "Dearly"?
It's how you'd start a letter to someone you care about.  
In this case, that someone is future you.

### Why so slow?
Speed implies urgency.  
This space should feel unrushed.

### Why private?
Your memories shouldn't be data.  
Everything stays on your device.

---

## 🌸 Credits

Built with care, slowness, and attention to softness.

---

*Dearly — a gentle place for your memories*