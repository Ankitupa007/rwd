import { openDB } from "idb";

const DB_NAME = "BoringReaderDB";
const STORE_NAME = "articles";
const VERSION = 1;

export async function initDB() {
  if (typeof window === "undefined" || !window.indexedDB) {
    console.warn("IndexedDB is not available in this environment");
    return null;
  }
  try {
    return await openDB(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "url" });
        }
      },
    });
  } catch (error) {
    console.error("Failed to initialize IndexedDB:", error);
    return null;
  }
}

export async function saveArticle(articleData) {
  const db = await initDB();
  if (!db) return false;
  try {
    await db.put(STORE_NAME, articleData);
    return true;
  } catch (error) {
    console.error("Failed to save article to IndexedDB:", error);
    return false;
  }
}

export async function getArticle(url) {
  const db = await initDB();
  if (!db) return null;
  try {
    return await db.get(STORE_NAME, url);
  } catch (error) {
    console.error(`Failed to get article from IndexedDB for ${url}:`, error);
    return null;
  }
}

export async function getAllArticles() {
  const db = await initDB();
  if (!db) return [];
  try {
    return await db.getAll(STORE_NAME);
  } catch (error) {
    console.error("Failed to get all articles from IndexedDB:", error);
    return [];
  }
}

export async function deleteArticle(url) {
  const db = await initDB();
  if (!db) return false;
  try {
    await db.delete(STORE_NAME, url);
    return true;
  } catch (error) {
    console.error(`Failed to delete article from IndexedDB for ${url}:`, error);
    return false;
  }
}

export async function clearArticles() {
  const db = await initDB();
  if (!db) return false;
  try {
    await db.clear(STORE_NAME);
    return true;
  } catch (error) {
    console.error("Failed to clear articles from IndexedDB:", error);
    return false;
  }
}
