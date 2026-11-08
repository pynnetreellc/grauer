// On-device storage using IndexedDB (the browser's built-in database).
// Two "stores": kv (small settings like the profile) and workouts (one row per session done).
// Nothing here ever leaves the device unless the user exports a backup.

const DB_NAME = 'grauer';
const DB_VERSION = 1;
let dbPromise;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      // Runs only when the database is new or DB_VERSION goes up.
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('workouts')) db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

// Wraps IndexedDB's callback style in a Promise so we can use async/await.
async function run(storeName, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const req = fn(tx.objectStore(storeName));
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const kvGet = (key) => run('kv', 'readonly', (s) => s.get(key));
export const kvSet = (key, value) => run('kv', 'readwrite', (s) => s.put(value, key));
export const addWorkout = (w) => run('workouts', 'readwrite', (s) => s.add(w));
export const allWorkouts = () => run('workouts', 'readonly', (s) => s.getAll());

export async function exportAll() {
  const db = await open();
  const kv = {};
  await new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readonly');
    const req = tx.objectStore('kv').openCursor();
    req.onsuccess = () => { const c = req.result; if (c) { kv[c.key] = c.value; c.continue(); } };
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  return { app: 'grauer', format: 1, exportedAt: new Date().toISOString(), kv, workouts: await allWorkouts() };
}

export async function importAll(data) {
  if (!data || data.app !== 'grauer' || !data.kv) throw new Error('That file is not a Grauer backup.');
  await wipe();
  for (const [k, v] of Object.entries(data.kv)) await kvSet(k, v);
  for (const w of data.workouts || []) await run('workouts', 'readwrite', (s) => s.put(w));
}

export async function wipe() {
  await run('kv', 'readwrite', (s) => s.clear());
  await run('workouts', 'readwrite', (s) => s.clear());
}
