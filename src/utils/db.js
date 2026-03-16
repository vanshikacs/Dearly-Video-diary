import { openDB } from 'idb';

const DB_NAME = 'Dearly';
const DB_VERSION = 3;

export const initDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('captures')) {
          const s = db.createObjectStore('captures', { keyPath: 'id', autoIncrement: true });
          s.createIndex('timestamp', 'timestamp');
          s.createIndex('feeling', 'feeling');
          s.createIndex('date', 'date');
        }
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'captureId' });
        }
        if (!db.objectStoreNames.contains('moments')) {
          const s = db.createObjectStore('moments', { keyPath: 'id', autoIncrement: true });
          s.createIndex('createdAt', 'createdAt');
        }
        if (!db.objectStoreNames.contains('letters')) {
          const s = db.createObjectStore('letters', { keyPath: 'id', autoIncrement: true });
          s.createIndex('deliveryDate', 'deliveryDate');
          s.createIndex('opened', 'opened');
        }
        if (!db.objectStoreNames.contains('monthlyLetters')) {
          const s = db.createObjectStore('monthlyLetters', { keyPath: 'id', autoIncrement: true });
          s.createIndex('monthYear', 'monthYear');
        }
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
      }
      // v3: profiles store already exists — expanded schema handled by default-merging in getProfile
    },
  });
};

// ─── Captures ────────────────────────────────────────────────────────────────
export const saveCapture = async (capture) => {
  const db = await initDB();
  return await db.add('captures', capture);
};
export const getAllCaptures = async () => {
  const db = await initDB();
  return await db.getAll('captures');
};
export const getCapturesByFeeling = async (feeling) => {
  const db = await initDB();
  return await db.getAllFromIndex('captures', 'feeling', feeling);
};

// ─── Videos ──────────────────────────────────────────────────────────────────
export const saveVideoBlob = async (captureId, blob) => {
  const db = await initDB();
  await db.put('videos', { captureId, blob });
};
export const getVideoBlob = async (captureId) => {
  const db = await initDB();
  const r = await db.get('videos', captureId);
  return r?.blob ?? null;
};

// ─── Moments ─────────────────────────────────────────────────────────────────
export const saveMoment = async (moment) => {
  const db = await initDB();
  const { blob, ...metadata } = moment;
  const id = await db.add('moments', { ...metadata, hasBlobKey: true });
  if (blob) await db.put('videos', { captureId: `moment_${id}`, blob });
  return id;
};
export const getAllMoments = async () => {
  const db = await initDB();
  const moments = await db.getAll('moments');
  return Promise.all(
    moments.map(async (m) => {
      const r = await db.get('videos', `moment_${m.id}`);
      return { ...m, blob: r?.blob ?? null };
    })
  );
};
export const deleteMoment = async (id) => {
  const db = await initDB();
  await db.delete('moments', id);
  try { await db.delete('videos', `moment_${id}`); } catch (_) {}
};

// ─── Letters ─────────────────────────────────────────────────────────────────
export const saveLetter = async (letter) => {
  const db = await initDB();
  return await db.add('letters', letter);
};
export const getAllLetters = async () => {
  const db = await initDB();
  return await db.getAll('letters');
};
export const getReadyLetters = async () => {
  const db = await initDB();
  const now = Date.now();
  const all = await db.getAll('letters');
  return all.filter((l) => l.deliveryDate <= now && !l.opened);
};
export const markLetterAsOpened = async (id) => {
  const db = await initDB();
  const l = await db.get('letters', id);
  if (l) { l.opened = true; l.openedAt = Date.now(); await db.put('letters', l); }
};

// ─── Monthly Letters ─────────────────────────────────────────────────────────
export const saveMonthlyLetter = async (l) => {
  const db = await initDB();
  return await db.add('monthlyLetters', l);
};
export const getMonthlyLetter = async (monthYear) => {
  const db = await initDB();
  const all = await db.getAllFromIndex('monthlyLetters', 'monthYear', monthYear);
  return all[0] ?? null;
};
export const getAllMonthlyLetters = async () => {
  const db = await initDB();
  return await db.getAll('monthlyLetters');
};

// ─── Profiles ────────────────────────────────────────────────────────────────
const PROFILE_ID = 'default';

export const DEFAULT_PROFILE = {
  id: PROFILE_ID,

  // Identity
  name: '',
  avatarEmoji: '🌸',
  tagline: '',
  memoryReminder: '',

  // Mood identity (multi-select)
  moodIdentity: ['peaceful'],

  // Visual theme
  theme: 'blush', // 'blush' | 'dusk' | 'forest' | 'parchment' | 'midnight'

  // Music
  musicVibe: 'ambient',     // 'ambient' | 'classical' | 'lofi' | 'cinematic' | 'folk' | 'none'
  musicEnergy: 'gentle',    // 'still' | 'gentle' | 'flowing' | 'warm'
  instrumentalOnly: true,
  defaultMusicTrackId: null,
  uploadedMusicName: '',

  // Reel style
  aspectRatio: '9:16',
  clipLength: 5,
  transition: 'fade',       // 'fade' | 'cut' | 'dissolve' | 'dreamy'
  overlayStyle: 'soft',     // 'none' | 'soft' | 'minimal' | 'poetic'
  textStyle: 'handwritten', // 'handwritten' | 'serif' | 'tiny'

  // Behaviour
  includeTextOverlays: true,
  autoGenerateMonthlyReel: false,
  kenBurns: true,

  createdAt: null,
  updatedAt: null,
};

export const getProfile = async () => {
  const db = await initDB();
  const stored = await db.get('profiles', PROFILE_ID);
  return { ...DEFAULT_PROFILE, ...stored, id: PROFILE_ID };
};

export const saveProfile = async (data) => {
  const db = await initDB();
  const existing = await db.get('profiles', PROFILE_ID);
  const updated = {
    ...DEFAULT_PROFILE,
    ...existing,
    ...data,
    id: PROFILE_ID,
    updatedAt: Date.now(),
    createdAt: existing?.createdAt ?? Date.now(),
  };
  await db.put('profiles', updated);
  return updated;
};

export const saveProfileMusic = async (blob) => {
  const db = await initDB();
  await db.put('videos', { captureId: 'profile_music', blob });
};

export const getProfileMusic = async () => {
  const db = await initDB();
  const r = await db.get('videos', 'profile_music');
  return r?.blob ?? null;
};