import { openDB } from "idb";

const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const DB_NAME = "RWD";
const ARTICLE_STORE_NAME = "articles";
const RSS_FEED_STORE_NAME = "rss_feeds";
const VERSION = 2; // Incremented version for schema change

export async function initDB() {
  if (typeof window === "undefined" || !window.indexedDB) {
    console.warn("IndexedDB is not available in this environment");
    return null;
  }
  try {
    return await openDB(DB_NAME, VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create articles store if it doesn't exist
        if (!db.objectStoreNames.contains(ARTICLE_STORE_NAME)) {
          db.createObjectStore(ARTICLE_STORE_NAME, { keyPath: "url" });
        }
        // Create rss_feeds store if it doesn't exist
        if (!db.objectStoreNames.contains(RSS_FEED_STORE_NAME)) {
          db.createObjectStore(RSS_FEED_STORE_NAME, { keyPath: "url" });
        }

        // Migration: Move RSS-related data from articles to rss_feeds
        if (oldVersion < 2) {
          const articleStore = transaction.objectStore(ARTICLE_STORE_NAME);
          const rssFeedStore = transaction.objectStore(RSS_FEED_STORE_NAME);
          articleStore.getAll().then((items) => {
            const rssItems = items.filter((item) =>
              item.url.startsWith("rss:")
            );
            rssItems.forEach((item) => {
              rssFeedStore.put(item).then(() => {
                articleStore.delete(item.url); // Remove from articles store
              });
            });
          });
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
    await db.put(ARTICLE_STORE_NAME, articleData);
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
    return await db.get(ARTICLE_STORE_NAME, url);
  } catch (error) {
    console.error(`Failed to get article from IndexedDB for ${url}:`, error);
    return null;
  }
}

export async function getAllArticles() {
  const db = await initDB();
  if (!db) return [];
  try {
    const allArticles = await db.getAll(ARTICLE_STORE_NAME);
    return allArticles.sort((a, b) => b.savedAt - a.savedAt);
  } catch (error) {
    console.error("Failed to get all articles from IndexedDB:", error);
    return [];
  }
}

export async function deleteArticle(url) {
  const db = await initDB();
  if (!db) return false;
  try {
    await db.delete(ARTICLE_STORE_NAME, url);
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
    await db.clear(ARTICLE_STORE_NAME);
    return true;
  } catch (error) {
    console.error("Failed to clear articles from IndexedDB:", error);
    return false;
  }
}

