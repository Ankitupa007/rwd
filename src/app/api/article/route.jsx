import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

// Utility function to calculate reading time
function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return { readingTime, wordCount: words };
}

// Utility function to extract metadata
function extractMetadata(document) {
  const getMetaContent = (selector) => {
    const element = document.querySelector(selector);
    return element
      ? element.getAttribute("content") || element.textContent
      : null;
  };

  return {
    title:
      getMetaContent('meta[property="og:title"]') ||
      getMetaContent('meta[name="twitter:title"]') ||
      document.title ||
      "Untitled",
    description:
      getMetaContent('meta[property="og:description"]') ||
      getMetaContent('meta[name="description"]') ||
      "",
    author:
      getMetaContent('meta[name="author"]') ||
      getMetaContent('meta[property="article:author"]') ||
      "Unknown",
    publishDate:
      getMetaContent('meta[property="article:published_time"]') ||
      getMetaContent('meta[name="date"]') ||
      new Date(),
    image:
      getMetaContent('meta[property="og:image"]') ||
      getMetaContent('meta[name="twitter:image"]') ||
      null,
    siteName: getMetaContent('meta[property="og:site_name"]') || "",
  };
}

// Retry utility function
async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      if (error.code === "EAI_AGAIN") {
        console.warn(
          `DNS error (EAI_AGAIN) for ${url}, retrying (${attempt}/${retries})...`
        );
      } else {
        console.warn(
          `Fetch attempt ${attempt} failed for ${url}: ${error.message}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
}

// Main extraction function
async function extractArticleContent(url) {
  try {
    // Validate URL
    let urlObj;
    try {
      urlObj = new URL(url);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        throw new Error("Invalid URL protocol");
      }
    } catch (error) {
      console.error(`URL validation failed for ${url}: ${error.message}`);
      throw new Error("Invalid URL format");
    }

    // Fetch the webpage with retry
    console.log(`Fetching URL: ${url}`);
    const response = await fetchWithRetry(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ReaderMode/1.0)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
      },
      timeout: 10000,
    });

    const html = await response.text();

    // Parse HTML with JSDOM
    console.log(`Parsing HTML for URL: ${url}`);
    let dom;
    try {
      dom = new JSDOM(html, { url });
    } catch (error) {
      console.error(`JSDOM parsing failed for ${url}: ${error.message}`);
      throw new Error("Failed to parse HTML content");
    }
    const document = dom.window.document;

    // Extract metadata
    const metadata = extractMetadata(document);
    // Use Readability to extract main content
    console.log(`Running Readability for URL: ${url}`);
    const reader = new Readability(document, {
      debug: false,
      maxElemsToParse: 0,
      nbTopCandidates: 10,
      charThreshold: 250,
      classesToPreserve: ["caption", "credit", "highlight"],
    });

    const article = reader.parse();

    if (!article) {
      console.error(`Readability failed to extract content for ${url}`);
      throw new Error(
        "Could not extract readable content from this page. The page may not contain enough readable text or may require JavaScript rendering."
      );
    }

    // Calculate reading statistics
    const textContent = article.textContent || "";
    const { readingTime, wordCount } = calculateReadingTime(textContent);

    // Clean and format content
    const cleanContent = article.content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    const articleData = {
      title: article.title || metadata.title,
      author: metadata.author,
      publishDate: metadata.publishDate,
      description: metadata.description,
      image: metadata.image,
      siteName: metadata.siteName,
      content: cleanContent,
      textContent: textContent,
      readingTime,
      wordCount,
      url: url,
      extractedAt: new Date().toISOString(),
      fromCache: false,
    };

    return {
      success: true,
      data: articleData,
    };
  } catch (error) {
    console.error(
      `Content extraction error for ${url}: ${error.message}`,
      error.stack
    );
    let errorMessage = "Failed to extract content";
    let code = "EXTRACTION_FAILED";

    if (error.code === "EAI_AGAIN") {
      errorMessage =
        "DNS resolution failed. Please check your network or try again later.";
      code = "DNS_ERROR";
    } else if (error.message.includes("Invalid URL")) {
      errorMessage = "The provided URL is invalid.";
      code = "INVALID_URL";
    } else if (error.message.includes("HTTP")) {
      errorMessage = `Server error: ${error.message}`;
      code = "HTTP_ERROR";
    } else if (error.message.includes("Could not extract readable content")) {
      errorMessage = error.message;
      code = "READABILITY_FAILED";
    } else if (error.message.includes("Failed to parse HTML")) {
      errorMessage =
        "Failed to parse the webpage HTML. The page may be malformed.";
      code = "JSDOM_ERROR";
    }

    return {
      success: false,
      error: errorMessage,
      code,
    };
  }
}

// App Router Version
export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) {
      console.error("No URL provided in request");
      return Response.json(
        {
          success: false,
          error: "URL is required",
          code: "MISSING_URL",
        },
        { status: 400 }
      );
    }

    const result = await extractArticleContent(url);

    return Response.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("API Error:", error);
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

export async function GET() {
  return Response.json(
    {
      success: false,
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}
