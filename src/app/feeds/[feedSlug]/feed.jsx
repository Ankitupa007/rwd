"use client";
import Extension from "@/components/common/Extension";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  clearRSSFeeds,
  deleteRSSFeed,
  getAllArticles,
  getAllRSSFeeds,
  getArticle,
  getRSSFeed,
  saveArticle,
  saveRSSFeed,
} from "@/lib/indexedDB";
import { useStore } from "@/lib/store";
import he from "he";
import { ArrowLeft, HardDrive, Loader, RefreshCcw, Rss, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Utility to format date
const getDateAndTime = (dateString) => {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const FeedPage = () => {
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
  const params = useParams();
  const { feedSlug } = params;
  const [feed, setFeed] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [urlHistory, setUrlHistory] = useState([]);
  const [isAddingFeed, setIsAddingFeed] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const [feeds, setFeeds] = useState([]);

  // Fetch feed data based on slug
  useEffect(() => {
    async function fetchFeed() {
      setIsLoading(true);
      const selectedFeed = await getRSSFeed(feedSlug);
      setFeed(selectedFeed);
      setIsLoading(false);
    }
    fetchFeed();

    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, [feedSlug]);

  // Refresh feed by fetching fresh data from API
  const handleRefreshFeed = async () => {
    if (isOffline) {
      toast.error(
        "You are offline. Please connect to the internet to refresh the feed.",
        { className: "bg-secondary text-foreground" }
      );
      return;
    }

    if (!feed?.feedUrl) {
      toast.error("No feed URL available to refresh.", {
        className: "bg-secondary text-foreground",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feed.feedUrl }),
      });
      const data = await response.json();

      if (data.success) {
        // Delete existing feed data
        await deleteRSSFeed(feed.feedUrl);

        // Save new feed data
        const saved = await saveRSSFeed({
          feedUrl: feed.feedUrl,
          title: data.data.title,
          slug: feed.slug, // Preserve existing slug to avoid breaking links
          items: data.data.items,
          favicon: data.data.favicon,
          savedAt: Date.now(),
        });

        if (saved) {
          // Fetch updated feed
          const updatedFeed = await getRSSFeed(feedSlug);
          setFeed(updatedFeed);
          toast.success("Feed refreshed successfully!", {
            className: "bg-secondary text-foreground",
          });
        } else {
          toast.error("Failed to save refreshed feed to cache.", {
            className: "bg-secondary text-foreground",
          });
        }
      } else {
        toast.error(`Error: ${data.error} (${data.code})`, {
          className: "bg-secondary text-foreground",
        });
      }
    } catch (error) {
      console.error("handleRefreshFeed error:", error.message);
      toast.error("Failed to refresh feed. Please try again.", {
        className: "bg-secondary text-foreground",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

    setIsAddingFeed(true);
    try {
      const response = await fetch("/api/rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feedUrl }),
      });
      const data = await response.json();
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
      setIsAddingFeed(false);
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

  // Open article in reader mode
  const handleArticleClick = (url, feedName) => {
    setUrl(url);
    extractContent(url, feedName);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[70vh]">
        <Loader size={16} className="w-4 h-4 animate-spin mr-2" />
        <span className="text-sm">refreshing feed...</span>
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-foreground">Feed Not Found</h2>
        <Link href="/feeds">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feeds
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <section>
      <div className="max-w-6xl mx-auto px-6">
        {loading && (
          <div className="flex justify-center items-center h-[70vh]">
            <Loader size={16} className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">hold on...</span>
          </div>
        )}
        {!content && !loading && (
          <div className="text-center py-8">
            <div className="py-10">
              <div className="flex flex-col items-center justify-center gap-4">
                <img
                  src={feed.favicon}
                  alt=""
                  className="w-16"
                  loading="lazy"
                  onError={(e) => (e.target.src = "/fallback-rss-favicon.png")}
                />
                <h2 className="text-5xl lg:text-7xl font-semibold my-4 tracking-tighter font-serif">
                  {feed.title}
                </h2>
              </div>
              <p className="text-lg text-foreground/80">
                <a href={feed.feedUrl}>{feed.feedUrl}</a>
              </p>
              {isOffline && (
                <p className="text-sm text-yellow-600 mt-2">
                  <HardDrive className="inline w-4 h-4 mr-1" />
                  You are offline. Showing cached articles.
                </p>
              )}
            </div>

            <div className="container mx-auto">
              <div className="flex justify-between items-center py-4">
                <Link href="/feeds">
                  <Button
                    variant={"default"}
                    className="mb-8 text-sm cursor-pointer rounded-full"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to Feeds
                  </Button>
                </Link>
                <Button
                  variant={"default"}
                  className="mb-8 text-sm cursor-pointer rounded-full"
                  onClick={handleRefreshFeed}
                  disabled={isLoading || isOffline}
                >
                  <RefreshCcw className="mr-1 h-4 w-4" /> Refresh Feed
                </Button>
              </div>
              <div className="mb-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {feed.items.map((item, itemIndex) => (
                    <Card
                      key={itemIndex}
                      className="group py-0 relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg bg-card border-border"
                      onClick={() =>
                        handleArticleClick(item.link, item.feedName)
                      }
                    >
                      <CardContent className="p-0">
                        <div className="p-4 text-left">
                          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 leading-tight">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                            <span>By {item.author || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <img
                              src={item.favicon}
                              alt=""
                              className="w-4"
                              loading="lazy"
                              onError={(e) =>
                                (e.target.src = "/fallback-rss-favicon.png")
                              }
                            />
                            <span>{item.feedName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-muted-foreground/80 bg-muted px-2 py-1 rounded-full">
                              {isOffline ? "cached" : "feed"}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              {getDateAndTime(item.pubDate)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
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
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
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
        <section className="py-8">
          <Extension />
        </section>
      </div>
    </section>
  );
};

export default FeedPage;
