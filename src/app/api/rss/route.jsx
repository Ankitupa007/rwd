import { JSDOM } from "jsdom";

// Convert string to URL-friendly slug
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Normalize publication date
function normalizeDate(dateString) {
  const parsed = Date.parse(dateString);
  return isNaN(parsed)
    ? new Date().toISOString()
    : new Date(parsed).toISOString();
}

// Utility to get clean text from DOM nodes
function getText(node) {
  return node?.textContent?.trim() || "";
}

// Clean and sanitize feed item
function cleanFeedItem(item) {
  return {
    title: item.title || "Untitled",
    link: item.link || "#",
    slug: slugify(item.title || item.link || ""),
    description: item.description || "",
    pubDate: normalizeDate(item.pubDate),
    author: item.author || "Unknown",
    feedName: item.feedName || "Unknown Feed",
    favicon: item.favicon || null,
  };
}

// Autodiscover feed from homepage <link rel="alternate">
async function discoverFeedUrl(homepageUrl) {
  try {
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      homepageUrl
    )}`;
    const res = await fetch(proxy);
    if (!res.ok) throw new Error("Failed homepage fetch");
    const html = await res.text();
    const dom = new JSDOM(html);
    const feedLink = dom.window.document.querySelector(
      'link[type="application/rss+xml"], link[type="application/atom+xml"]'
    );
    if (feedLink?.href) {
      return new URL(feedLink.href, homepageUrl).href;
    }
  } catch (e) {
    console.warn(`Feed discovery failed: ${e.message}`);
  }
  return null;
}

// Try multiple proxy URLs to fetch the feed
async function fetchWithProxy(url, contentType = "text/xml") {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: contentType,
        },
      });
      if (res.ok) return await res.text();
    } catch (_) {}
  }
  throw new Error("All proxy fetches failed");
}

// Fetch favicon from homepage
async function fetchFavicon(websiteUrl) {
  try {
    const urlObj = new URL(websiteUrl);
    const homepageUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    const html = await fetchWithProxy(homepageUrl, "text/html");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const link = document.querySelector(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
    );
    if (link?.href) {
      return new URL(link.href, homepageUrl).href;
    }
    return `${homepageUrl}/favicon.ico`;
  } catch (err) {
    console.warn(`Favicon fetch failed: ${err.message}`);
    return null;
  }
}

// Fetch and parse RSS/Atom feed
async function fetchRSSFeed(inputUrl) {
  try {
    let url = inputUrl;
    const urlObj = new URL(url);

    // Autodiscover if homepage was provided
    if (!url.endsWith(".xml") && !url.includes("rss")) {
      const discovered = await discoverFeedUrl(url);
      if (discovered) url = discovered;
    }

    const rawXml = await fetchWithProxy(url, "application/xml");
    const dom = new JSDOM(rawXml, { contentType: "text/xml" });
    const document = dom.window.document;

    const feedName =
      getText(document.querySelector("channel > title")) ||
      getText(document.querySelector("feed > title")) ||
      "Untitled Feed";
    const favicon = await fetchFavicon(url);
    const slug = slugify(feedName);

    const items = Array.from(document.querySelectorAll("item, entry")).map(
      (item) => {
        const isAtom = item.tagName.toLowerCase() === "entry";
        return {
          title: getText(item.querySelector("title")),
          link: isAtom
            ? item.querySelector("link")?.getAttribute("href") || ""
            : getText(item.querySelector("link")) ||
              getText(item.querySelector("guid")) ||
              "#",
          description:
            getText(item.querySelector("description")) ||
            getText(item.querySelector("summary")) ||
            getText(item.querySelector("content")) ||
            "",
          pubDate:
            getText(item.querySelector("pubDate")) ||
            getText(item.querySelector("updated")) ||
            new Date().toISOString(),
          author:
            getText(item.querySelector("author > name")) ||
            getText(item.querySelector("author")) ||
            "Unknown",
          feedName,
          favicon,
        };
      }
    );

    const validItems = items
      .filter((item) => item.title && item.link)
      .map(cleanFeedItem);

    if (!validItems.length) {
      throw new Error("No valid feed items found");
    }

    return {
      success: true,
      data: {
        feedUrl: url,
        slug,
        items: validItems,
        title: feedName,
        favicon,
      },
    };
  } catch (error) {
    console.error(`RSS fetch error: ${error.message}`);
    return {
      success: false,
      error: `Failed to fetch RSS feed: ${error.message}`,
      code: error.message.includes("Invalid URL")
        ? "INVALID_URL"
        : "FETCH_ERROR",
    };
  }
}

// Next.js POST endpoint
export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url) {
      return Response.json(
        { success: false, error: "URL is required", code: "MISSING_URL" },
        { status: 400 }
      );
    }

    const result = await fetchRSSFeed(url);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch (err) {
    console.error("RSS API error:", err);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

// Next.js GET endpoint (not allowed)
export async function GET() {
  return Response.json(
    { success: false, error: "Method not allowed", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}
