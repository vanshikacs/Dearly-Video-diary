# Dearly

### *A quiet place for the moments you want to keep.*

---

I've always found it hard to hold on to ordinary days. Not the big ones — those get photographed and shared. I mean the small ones. A particular afternoon light. The feeling of a walk you didn't think would matter. The version of yourself that existed on a random Tuesday in March.

Dearly started as a way to build something for that feeling. A video diary that doesn't ask you to perform or summarize or optimize — just to notice, and to save.

**[→ Try it live at dearly.vercel.app](https://dearly.vercel.app/)**

---

## What it is

Dearly is a private, browser-based video diary. You record short clips, write a few words, tag how you're feeling, and let the app hold onto them. At the end of a month, it writes you a letter about the time that passed. You can write letters to your future self. You can generate soft, music-backed reels from your older memories.

Everything stays on your device — no accounts, no cloud, no one watching. That was important to me from the start.

---

## Features

**Capture** — Record video moments directly in the browser. Write alongside them. Choose how today feels from a set of soft emotional tags: peaceful, warm, nostalgic, tender, quiet, hopeful, and more.

**Gallery** — A visual grid of your captured moments. Hover to play. Click to open.

**Reflections** — Gentle observations about your patterns over time. Not metrics — more like noticing. Things like: you tend to record in the evenings, or the last few weeks have been quieter than usual.

**Letters to self** — Write to future you. Set a delivery date — one month, six months, a year, or a custom date. The letter waits. When the time comes, it arrives.

**Monthly letters** — At each month's end, Dearly generates a short narrative letter about your captures — your dominant feeling, what shifted, how often you showed up. It reads like something a thoughtful friend might write, not a data report.

**Moments** — A reel generation system. Selects clips from your memories, trims them, applies a gentle Ken Burns zoom, adds date and feeling overlays, layers in ambient background music, and stitches everything into a short video you can keep or download.

**Profile** — Visual themes (Blush, Dusk, Forest, Parchment, Midnight), mood identity chips, music preferences, reel format settings, and a couple of personal memory fields that only you'll ever read.

---

## Tech stack

- **React 18** + **Vite**
- **React Router v6** for client-side routing
- **Framer Motion** for animation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **IndexedDB** (via the `idb` library) for all local storage — videos, letters, moments, profile
- **Canvas API + MediaRecorder** for video trimming, stitching, and overlay rendering
- **Web Audio API** for procedural ambient music synthesis and audio mixing into reels

No backend. No database. No API keys. No environment variables needed.

---

## How I thought about it

The hardest part of building Dearly wasn't technical — it was tonal. It's easy to build a video recorder. It's much harder to build one that feels like it respects you.

Every word in the interface went through several versions. "Record entry" became "Capture softly." "Save" became "Keep this." "Mood tracker" became "How does today feel?" These feel like small things, but they're actually the whole product. The difference between an app that feels clinical and one that feels warm usually lives in copy and pacing, not in features.

I also thought a lot about slowness. Most apps are optimized for speed and engagement. Dearly is optimized for the opposite. Animations breathe rather than snap. Nothing bounces. There's no notification, no streak counter, no reason to open the app except that you want to.

The privacy-first decision was also a deliberate design choice, not just a technical one. I didn't want users to feel like their quiet moments were being stored somewhere they couldn't see. Keeping everything in the browser's IndexedDB meant the data is genuinely theirs — which also meant I had to solve some interesting problems around storing video blobs efficiently and handling database version migrations without breaking existing data.

---

## Challenges I worked through

**Video processing in the browser** is genuinely hard. I went through a few approaches before landing on a Canvas + MediaRecorder pipeline that actually works — trimming clips, applying a Ken Burns zoom, rendering text overlays, and stitching multiple clips into one recording session without dropping frames or losing sync.

**Audio mixing into reels** was the trickiest piece. The initial version had no sound at all. Adding music meant decoding audio blobs with `decodeAudioData`, synthesizing built-in ambient tracks procedurally using `OfflineAudioContext`, combining the audio `MediaStream` with the canvas video stream, and fading it in and out gracefully around the recorder lifecycle. Getting that to work reliably across Chrome and Firefox took a lot of debugging.

**Deployment broke in a way I didn't expect.** The import path `LetterstoSelf` worked fine on my Mac, but failed silently on Vercel because Linux file systems are case-sensitive. That kind of bug — where everything looks fine locally and breaks only in production — taught me to be much more careful about file naming consistency.

**React Router on static hosts** also needed explicit configuration. Without a `_redirects` file for Netlify or a `vercel.json` rewrite rule, navigating directly to `/reflections` would return a 404. Small thing, important thing.

**IndexedDB versioning** — when I added the profiles store, I had to bump the database version and write a proper migration so existing users wouldn't hit errors on upgrade. It's not glamorous work, but getting it right matters.

---

## What I learned

I came into this project comfortable with React but much less comfortable with browser APIs. By the end, I'd spent meaningful time with `MediaRecorder`, `AudioContext`, `OfflineAudioContext`, `MediaStream`, `IndexedDB`, and the Canvas 2D rendering pipeline. That was genuinely new territory and I'm glad I went there.

I also learned that frontend product thinking — caring about copy, pacing, emotional tone, empty states, error messages — is a real skill that takes as much thought as the technical side. Maybe more, in a project like this.

And I learned that debugging deployment issues is part of the work, not a distraction from it. Getting something from "works on my machine" to "works reliably in production" is a full step in the process.

---

## What I'd improve

A few things I'd want to come back to:

- **iOS support** — `MediaRecorder` on Safari has limitations that affect recording and reel generation. A proper iOS-compatible fallback would make the app usable for a lot more people.
- **Data export** — Right now, if you clear your browser storage, your memories are gone. A way to export and import your data (even just a JSON + video zip) would make Dearly feel more trustworthy for long-term use.
- **Reel quality** — The Canvas approach works, but a WebAssembly-based video encoder would produce significantly better output, especially for 9:16 reels intended for sharing.
- **Offline PWA** — The app already works offline once loaded, but making it a proper installable PWA with a service worker would feel right for something this personal.
- **Shared moments** — A way to optionally generate a shareable link for a single moment (without exposing your full diary) would be a meaningful social layer, done carefully.

---

## Run it locally

```bash
git clone https://github.com/vanshikacs/Dearly-Video-diary.git
cd Dearly-Video-diary
npm install
npm run dev
```

Open `http://localhost:5173`. Camera access will be requested when you try to record — allow it, and it should work from there.

To build for production:

```bash
npm run build
npm run preview  # previews the production build at localhost:4173
```

No environment variables needed. Nothing to configure.

---

## A note

This is one of the projects I'm most proud of, not because it's the most technically complex thing I've built, but because it's the most considered. I wanted to make something that felt genuinely human — and I think, most of the time, it does.

If you use it and something breaks, or something could feel better, I'd genuinely like to know.

---

*Dearly — built with care, and a lot of time spent on the words.*