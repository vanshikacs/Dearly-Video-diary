/**
 * momentGenerator.js
 *
 * Generates multi-clip video reels with music.
 * Audio is resolved from: uploaded file > built-in track > silence.
 */

import { getAllCaptures, getVideoBlob, saveMoment, getProfile, getProfileMusic } from './db';
import { trimVideo, stitchVideos, applyKenBurns } from './videoProcessor';
import { resolveAudioBuffer } from './audioEngine';

const FEELING_EMOJIS = {
  peaceful: '🕊️', grateful: '🙏', gentle: '🌸', quiet: '🌙',
  warm: '☕', hopeful: '🌿', tender: '💭', calm: '🌊',
  thoughtful: '🍂', nostalgic: '📜',
};

const PEACEFUL_FEELINGS = new Set(['peaceful', 'gentle', 'calm', 'quiet', 'warm', 'tender', 'hopeful']);

const buildOverlayText = (capture, overlayStyle) => {
  if (!overlayStyle || overlayStyle === 'none') return null;
  const dateStr = new Date(capture.timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const emoji = FEELING_EMOJIS[capture.feeling] ?? '💭';
  switch (overlayStyle) {
    case 'minimal': return dateStr;
    case 'poetic':  return `${dateStr} · ${capture.feeling || 'gentle'}`;
    default:        return `${dateStr}  ${emoji}`;
  }
};

const resolveResolution = (ratio) => {
  switch (ratio) {
    case '9:16': return { width: 720,  height: 1280 };
    case '1:1':  return { width: 1080, height: 1080 };
    default:     return { width: 1280, height: 720  };
  }
};

const resolveFadeDuration = (transition) => {
  switch (transition) {
    case 'cut':     return 0;
    case 'dissolve':return 0.8;
    case 'dreamy':  return 1.2;
    default:        return 0.5;
  }
};

const getVideoDuration = (url) =>
  new Promise((resolve) => {
    const v = document.createElement('video');
    v.src = url;
    v.onloadedmetadata = () => resolve(v.duration);
    v.onerror = () => resolve(10);
  });

const selectClips = (captures, theme, moodIdentity, maxClips) => {
  let pool = [...captures];
  const moodSet = new Set(moodIdentity || []);

  switch (theme) {
    case 'older':   pool.sort((a, b) => a.timestamp - b.timestamp); break;
    case 'recent':  pool.sort((a, b) => b.timestamp - a.timestamp); break;
    case 'peaceful': {
      const pref = moodSet.size > 0 ? moodSet : PEACEFUL_FEELINGS;
      const m = pool.filter((c) => pref.has(c.feeling));
      pool = m.length > 0 ? m.sort(() => Math.random() - 0.5) : pool.sort(() => Math.random() - 0.5);
      break;
    }
    default: {
      const byFeeling = pool.filter((c) => c.feeling === theme);
      if (byFeeling.length > 0) { pool = byFeeling.sort(() => Math.random() - 0.5); break; }
      if (moodSet.size > 0) {
        const byMood = pool.filter((c) => moodSet.has(c.feeling));
        pool = byMood.length > 0 ? byMood.sort(() => Math.random() - 0.5) : pool.sort(() => Math.random() - 0.5);
      } else {
        pool.sort(() => Math.random() - 0.5);
      }
    }
  }
  return pool.slice(0, maxClips);
};

export const generateMoment = async (options = {}) => {
  const profile = await getProfile();

  const {
    theme        = 'older',
    maxClips     = 5,
    clipDuration = profile.clipLength    ?? 5,
    aspectRatio  = profile.aspectRatio   ?? '9:16',
    transition   = profile.transition    ?? 'fade',
    overlayStyle = profile.overlayStyle  ?? 'soft',
    useKenBurns  = profile.kenBurns      ?? true,
    moodIdentity = profile.moodIdentity  ?? [],
  } = options;

  // ── 1. Load captures ──────────────────────────────────────────────────────
  const allCaptures = await getAllCaptures();
  const capturesWithVideo = [];
  for (const capture of allCaptures) {
    const blob = await getVideoBlob(capture.id);
    if (blob) capturesWithVideo.push({ ...capture, videoBlob: blob });
  }
  if (capturesWithVideo.length === 0) throw new Error("Nothing here yet. That's okay.");

  // ── 2. Select + trim clips ────────────────────────────────────────────────
  const selected = selectClips(capturesWithVideo, theme, moodIdentity, maxClips);
  if (selected.length === 0) throw new Error('Not enough matching moments for this theme yet.');

  const { width, height } = resolveResolution(aspectRatio);
  const fadeDuration = resolveFadeDuration(transition);
  const totalDuration = selected.length * clipDuration;

  const clipDefs = [];
  for (const capture of selected) {
    try {
      const tempUrl = URL.createObjectURL(capture.videoBlob);
      const sourceDuration = await getVideoDuration(tempUrl);
      URL.revokeObjectURL(tempUrl);

      const maxStart = Math.max(0, sourceDuration - clipDuration);
      const startTime = maxStart > 0 ? maxStart * 0.33 : 0;

      let clip = await trimVideo(capture.videoBlob, startTime, clipDuration);
      if (useKenBurns) clip = await applyKenBurns(clip, 1.06);

      clipDefs.push({
        blob: clip,
        overlayText: buildOverlayText(capture, overlayStyle),
      });
    } catch (err) {
      console.warn(`Skipping clip ${capture.id}:`, err.message);
    }
  }
  if (clipDefs.length === 0) throw new Error('All clips failed to process. Please try again.');

  // ── 3. Resolve audio ──────────────────────────────────────────────────────
  // Only attempt audio if the profile wants music
  let audioBuffer = null;
  if (profile.musicVibe !== 'none') {
    const uploadedBlob = await getProfileMusic();
    const trackId = profile.defaultMusicTrackId;
    audioBuffer = await resolveAudioBuffer(trackId, uploadedBlob, totalDuration + 4);
  }

  // ── 4. Stitch with audio ──────────────────────────────────────────────────
  const reelBlob = await stitchVideos(clipDefs, {
    targetWidth:  width,
    targetHeight: height,
    fps:          30,
    fadeDuration,
    audioBuffer,  // null = no music; AudioBuffer = mixed in
  });

  // ── 5. Save ───────────────────────────────────────────────────────────────
  const momentData = {
    blob: reelBlob,
    theme,
    clipCount: clipDefs.length,
    createdAt: Date.now(),
    captures: selected.map((c) => c.id),
    aspectRatio,
    transition,
    overlayStyle,
    profileSnapshot: {
      musicVibe:   profile.musicVibe,
      musicEnergy: profile.musicEnergy,
      moodIdentity: profile.moodIdentity,
      themeName:   profile.theme,
    },
  };

  const momentId = await saveMoment(momentData);
  return { id: momentId, blob: reelBlob, url: URL.createObjectURL(reelBlob), ...momentData };
};

export const downloadMoment = (blob, themeName = 'moment') => {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dearly-${themeName}-${Date.now()}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};