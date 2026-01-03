import { openDB } from 'idb';

const DB_NAME = 'Dearly';
const DB_VERSION = 1;

export const initDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Captures (video/text entries with "Dearly," prefix)
      if (!db.objectStoreNames.contains('captures')) {
        const captureStore = db.createObjectStore('captures', {
          keyPath: 'id',
          autoIncrement: true,
        });
        captureStore.createIndex('timestamp', 'timestamp');
        captureStore.createIndex('feeling', 'feeling');
        captureStore.createIndex('date', 'date');
      }
      
      // Video blobs
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'captureId' });
      }
      
      // Moments (generated video reels)
      if (!db.objectStoreNames.contains('moments')) {
        const momentStore = db.createObjectStore('moments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        momentStore.createIndex('createdAt', 'createdAt');
      }
      
      // Letters to Self
      if (!db.objectStoreNames.contains('letters')) {
        const letterStore = db.createObjectStore('letters', {
          keyPath: 'id',
          autoIncrement: true,
        });
        letterStore.createIndex('deliveryDate', 'deliveryDate');
        letterStore.createIndex('opened', 'opened');
      }
      
      // Monthly Letters (AI-generated)
      if (!db.objectStoreNames.contains('monthlyLetters')) {
        const monthlyStore = db.createObjectStore('monthlyLetters', {
          keyPath: 'id',
          autoIncrement: true,
        });
        monthlyStore.createIndex('monthYear', 'monthYear');
      }
    },
  });
};

// Capture operations
export const saveCapture = async (capture) => {
  const db = await initDB();
  const id = await db.add('captures', capture);
  return id;
};

export const getAllCaptures = async () => {
  const db = await initDB();
  return await db.getAll('captures');
};

export const getCapturesByFeeling = async (feeling) => {
  const db = await initDB();
  return await db.getAllFromIndex('captures', 'feeling', feeling);
};

// Video operations
export const saveVideoBlob = async (captureId, blob) => {
  const db = await initDB();
  await db.put('videos', { captureId, blob });
};

export const getVideoBlob = async (captureId) => {
  const db = await initDB();
  const record = await db.get('videos', captureId);
  return record?.blob;
};

// Moment operations
export const saveMoment = async (moment) => {
  const db = await initDB();
  const id = await db.add('moments', moment);
  return id;
};

export const getAllMoments = async () => {
  const db = await initDB();
  return await db.getAll('moments');
};

export const deleteMoment = async (id) => {
  const db = await initDB();
  await db.delete('moments', id);
};

// Letter operations
export const saveLetter = async (letter) => {
  const db = await initDB();
  const id = await db.add('letters', letter);
  return id;
};

export const getAllLetters = async () => {
  const db = await initDB();
  return await db.getAll('letters');
};

export const getReadyLetters = async () => {
  const db = await initDB();
  const now = Date.now();
  const all = await db.getAll('letters');
  return all.filter(letter => letter.deliveryDate <= now && !letter.opened);
};

export const markLetterAsOpened = async (id) => {
  const db = await initDB();
  const letter = await db.get('letters', id);
  if (letter) {
    letter.opened = true;
    letter.openedAt = Date.now();
    await db.put('letters', letter);
  }
};

// Monthly letter operations
export const saveMonthlyLetter = async (letter) => {
  const db = await initDB();
  const id = await db.add('monthlyLetters', letter);
  return id;
};

export const getMonthlyLetter = async (monthYear) => {
  const db = await initDB();
  const all = await db.getAllFromIndex('monthlyLetters', 'monthYear', monthYear);
  return all[0];
};

export const getAllMonthlyLetters = async () => {
  const db = await initDB();
  return await db.getAll('monthlyLetters');
};