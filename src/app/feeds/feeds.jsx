"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  clearRSSFeeds,
  deleteRSSFeed,
  getAllArticles,
  getAllRSSFeeds,
  getArticle,
  saveArticle,
  saveRSSFeed,
} from "@/lib/indexedDB";
import { useStore } from "@/lib/store";
import he from "he";
import { FileText, HardDrive, Loader, Rss, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FeedCard from "./[feedSlug]/FeedCard";
import Extension from "@/components/common/Extension";

const Feeds = () => {
  const {
    url,
    setUrl,
    fontFamily,
    fontSize,
    readingTime,
    setReadingTime,
    content,
    setContent,
    loading,
    setLoading,
  } = useStore();
  const [urlHistory, setUrlHistory] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const [feeds, setFeeds] = useState([]);
  const u = useSearchParams().get("u");

  // Load history and offline status on client-side mount
  useEffect(() => {
    async function loadHistory() {
      const articles = await getAllArticles();
      setUrlHistory(articles);
    }
    loadHistory();

    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle search param `u`
  useEffect(() => {
    const handleParams = () => {
      if (!u) return;
      if (!u.startsWith("http")) toast("Invalid URL");
      if (u) {
        setIsloading(true);
        let normalizedUrl = decodeURIComponent(u);
        if (!u.startsWith("http://") && !u.startsWith("https://")) {
          normalizedUrl = `https://${u}`;
        }
        setUrl(normalizedUrl);
        try {
          new URL(normalizedUrl);
          extractContent(normalizedUrl);
          setIsloading(false);
        } catch (error) {
          console.error("Invalid URL:", normalizedUrl, error);
          toast.error("Please enter a valid URL.", {
            className: "bg-secondary text-foreground",
          });
        }
      }
    };
    handleParams();
  }, [u, setUrl]);

  const extractContent = async (inputUrl, feedName) => {
    setLoading(true);
    try {
      const cachedArticle = await getArticle(inputUrl);
      if (cachedArticle) {
        setContent(cachedArticle);
        setReadingTime(cachedArticle.readingTime);
        const articles = await getAllArticles();
        setUrlHistory(articles);
        return;
      }

      if (isOffline) {
        toast.error(
          "You are offline. Please connect to the internet to fetch new articles.",
          { className: "bg-secondary text-foreground" }
        );
        return;
      }

      const response = await fetch("/api/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl, feedName: feedName }),
      });
      const data = await response.json();
      if (data.success) {
        setContent(data.data);
        setReadingTime(data.data.readingTime);
        setUrl("");
        const saved = await saveArticle({
          ...data.data,
          fromCache: false,
          savedAt: Date.now(),
        });
        if (!saved) {
          toast("Failed to save article to cache");
        }
        const articles = await getAllArticles();
        setUrlHistory(articles);
      } else {
        console.error("API error:", data.error, data.code);
        toast.error(`Error: ${data.error} (${data.code})`);
      }
    } catch (error) {
      console.error("extractContent error:", error.message);
      toast.error("Failed to fetch article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const decodeTitle = (title) => {
    return he.decode(title);
  };

  // Load saved feeds on mount
  useEffect(() => {
    async function loadFeeds() {
      const savedFeeds = await getAllRSSFeeds();
      setFeeds(savedFeeds);
    }
    loadFeeds();
  }, []);

  // Add a new RSS feed
  const handleAddFeed = async () => {
    if (!feedUrl.trim()) {
      toast.error("Please enter a feed URL.", {
        className: "bg-secondary text-foreground",
      });
      return;
    }

    try {
      new URL(feedUrl); // Validate URL format
    } catch {
      toast.error("Please enter a valid URL.", {
        className: "bg-secondary text-foreground",
      });
      return;
    }

    // Check for duplicates
    if (feeds.some((feed) => feed.feedUrl === feedUrl)) {
      toast.error("This feed is already added.", {
        className: "bg-secondary text-foreground",
      });
      return;
    }

    if (isOffline) {
      toast.error(
        "You are offline. Please connect to the internet to add new feeds.",
        {
          className: "bg-secondary text-foreground",
        }
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feedUrl }),
      });
      const data = await response.json();
      console.log(data.data.favicon);
      if (data.success) {
        const saved = await saveRSSFeed({
          feedUrl,
          title: data.data.title,
          slug: data.data.slug,
          items: data.data.items,
          favicon: data.data.favicon,
          savedAt: Date.now(),
        });
        if (saved) {
          const updatedFeeds = await getAllRSSFeeds();
          setFeeds(updatedFeeds);
          setFeedUrl("");
          toast.success("Feed added successfully!", {
            className: "bg-secondary text-foreground",
          });
        } else {
          toast.error("Failed to save feed to cache.", {
            className: "bg-secondary text-foreground",
          });
        }
      } else {
        toast.error(`Error: ${data.error} (${data.code})`, {
          className: "bg-secondary text-foreground",
        });
      }
    } catch (error) {
      toast.error("Failed to fetch RSS feed.", {
        className: "bg-secondary text-foreground",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a feed
  const handleDeleteFeed = async (feedUrl) => {
    const deleted = await deleteRSSFeed(feedUrl);
    if (deleted) {
      const updatedFeeds = await getAllRSSFeeds();
      setFeeds(updatedFeeds);
      toast.success("Feed removed.", {
        className: "bg-secondary text-foreground",
      });
    } else {
      toast.error("Failed to remove feed.", {
        className: "bg-secondary text-foreground",
      });
    }
  };

  // Clear all feeds
  const handleClearAllFeeds = async () => {
    const cleared = await clearRSSFeeds();
    if (cleared) {
      setFeeds([]);
      toast.success("All feeds cleared.", {
        className: "bg-secondary text-foreground",
      });
    } else {
      toast.error("Failed to clear feeds.", {
        className: "bg-secondary text-foreground",
      });
    }
  };

  // Open article in reader mode
  const handleArticleClick = (url, feedName) => {
    setUrl(url);
    console.log(url, feedName);
    extractContent(url, feedName);
  };

  // Format date
  const getDateAndTime = (pubDate) => {
    if (!pubDate) return "Unknown date";
    const date = new Date(pubDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen transition-all duration-500">
      <div className="max-w-6xl mx-auto px-6">
        {loading && (
          <div className="flex justify-center items-center h-[50vh]">
            <Loader size={16} className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">hold on...</span>
          </div>
        )}

        {!content && !loading && (
          <div className="text-center py-8">
            <div className="py-10">
              <span className="mb-12 text-xs text-foreground/60 font-bold uppercase">
                ZERO ADS | NO POP-UPS | ONLY CONTENT
              </span>
              <h2 className="text-5xl lg:text-7xl font-semibold my-4 tracking-tighter font-serif">
                Your RSS Feeds <span className="">List</span>
              </h2>
              <p className="text-lg text-gray-600">
                Enter a feed URL to save your favourite RSS list here and read
                its articles in a beautiful reader.
              </p>
              {isOffline && (
                <p className="text-sm text-yellow-600 mt-2">
                  <HardDrive className="inline w-4 h-4 mr-1" />
                  You are offline. Showing cached articles.
                </p>
              )}
            </div>
            <div className="max-w-md mx-auto mb-8">
              <div className="relative max-w-lg mx-auto">
                <Rss className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="url"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  placeholder="https://example.com/rss"
                  className="w-full pl-12 pr-16 text-foreground/90 placeholder:text-foreground/30 py-6 rounded-full border border-border focus-visible:ring-0 transition-all duration-300"
                  onKeyDown={(e) => e.key === "Enter" && handleAddFeed()}
                  disabled={isOffline || loading}
                />
                <Button
                  variant="default"
                  onClick={handleAddFeed}
                  disabled={loading || isOffline}
                  className="absolute right-1 top-1 w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Rss size={18} />
                  )}
                </Button>
              </div>
            </div>

            {/* Extension */}
            <Extension />

            <section className="mt-8">
              <div className="flex justify-between items-center my-8">
                <h3 className="text-lg font-semibold text-foreground">
                  RSS Feeds {feeds.length > 0 && `(${feeds.length})`}
                </h3>
                <Button
                  variant="secondary"
                  onClick={handleClearAllFeeds}
                  className="text-sm text-gray-500 hover:text-red-700 cursor-pointer rounded-full"
                >
                  Clear All Feeds
                </Button>
              </div>

              {feeds.map((feed, index) => (
                <FeedCard
                  key={index}
                  feed={feed}
                  index={index}
                  handleDeleteFeed={handleDeleteFeed}
                />
              ))}
            </section>
          </div>
        )}

        {content && !loading && (
          <article className="max-w-3xl mx-auto backdrop-blur-xl rounded-3xl py-8 bg-background">
            <header className="mb-8 pb-6 border-b border-black/10">
              <h1
                className="text-4xl font-bold mb-4 leading-tight"
                style={{
                  fontSize: `${fontSize + 16}px`,
                  fontFamily:
                    fontFamily === "serif"
                      ? 'et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif'
                      : fontFamily === "sans"
                      ? "Maison Neue"
                      : "Monaco, monospace",
                }}
              >
                {decodeTitle(content.title)}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span>By {content.author}</span>
                <span>•</span>
                <span>{getDateAndTime(content.publishDate)}</span>
                <span>•</span>
                <span>{readingTime} min read</span>
                <span>•</span>
                <span>{content.wordCount} words</span>
                {content.fromCache && (
                  <>
                    <span>•</span>
                    <span className="text-blue-500">Loaded from cache</span>
                  </>
                )}
              </div>
            </header>
            <div>
              {content.image && (
                <div className="relative overflow-hidden h-full">
                  <img
                    src={content.image}
                    alt={decodeTitle(content.title)}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 rounded-lg"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              )}
            </div>
            <div
              className="prose prose-lg dark:prose-invert max-w-none leading-relaxed"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily:
                  fontFamily === "serif"
                    ? 'et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif'
                    : fontFamily === "sans"
                    ? "Maison Neue"
                    : "Monaco, monospace",
              }}
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          </article>
        )}
      </div>
    </div>
  );
};

export default Feeds;
