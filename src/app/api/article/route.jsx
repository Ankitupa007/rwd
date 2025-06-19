import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

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
    return element ? element.getAttribute('content') || element.textContent : null;
  };

  return {
    title: getMetaContent('meta[property="og:title"]') ||
      getMetaContent('meta[name="twitter:title"]') ||
      document.title || 'Untitled',
    description: getMetaContent('meta[property="og:description"]') ||
      getMetaContent('meta[name="description"]') || '',
    author: getMetaContent('meta[name="author"]') ||
      getMetaContent('meta[property="article:author"]') || 'Unknown',
    publishDate: getMetaContent('meta[property="article:published_time"]') ||
      getMetaContent('meta[name="date"]') || new Date().toISOString().split('T')[0],
    image: getMetaContent('meta[property="og:image"]') ||
      getMetaContent('meta[name="twitter:image"]') || null,
    siteName: getMetaContent('meta[property="og:site_name"]') || ''
  };
}

// Main extraction function
async function extractArticleContent(url) {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol');
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ReaderMode/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse HTML with JSDOM
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // Extract metadata
    const metadata = extractMetadata(document);

    // Use Readability to extract main content
    const reader = new Readability(document, {
      debug: false,
      maxElemsToParse: 0,
      nbTopCandidates: 5,
      charThreshold: 500,
      classesToPreserve: ['caption', 'credit', 'highlight'],
    });

    const article = reader.parse();

    if (!article) {
      throw new Error('Could not extract readable content from this page');
    }

    // Calculate reading statistics
    const textContent = article.textContent || '';
    const { readingTime, wordCount } = calculateReadingTime(textContent);

    // Clean and format content
    const cleanContent = article.content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    return {
      success: true,
      data: {
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
        extractedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Content extraction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to extract content',
      code: 'EXTRACTION_FAILED'
    };
  }
}

// App Router Version (app/api/extract/route.js)
export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return Response.json(
        {
          success: false,
          error: 'URL is required',
          code: 'MISSING_URL'
        },
        { status: 400 }
      );
    }

    const result = await extractArticleContent(url);

    return Response.json(result, {
      status: result.success ? 200 : 400
    });

  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json(
    {
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  );
}