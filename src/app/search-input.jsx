"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import he from "he";
import {
  clearArticles,
  deleteArticle,
  getAllArticles,
  getArticle,
  saveArticle,
} from "@/lib/indexedDB";
import { useStore } from "@/lib/store";
import { ArrowRight, HardDrive, Loader, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SearchInput = () => {
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
  const u = useSearchParams().get("u");

  // Load history and offline status on client-side mount
  useEffect(() => {
    async function loadHistory() {
      const articles = await getAllArticles();
      setUrlHistory(articles); // Most recent first
    }
    loadHistory();

    // Set initial offline status and listen for changes
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
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
        console.log("Search param u:", u); // Debug log
        let normalizedUrl = decodeURIComponent(u);
        // Add https:// if no protocol is specified
        if (!u.startsWith("http://") && !u.startsWith("https://")) {
          normalizedUrl = `https://${u}`;
        }
        setUrl(normalizedUrl); // Update input field
        try {
          new URL(normalizedUrl); // Validate URL
          console.log("Valid URL, calling extractContent with:", normalizedUrl);
          extractContent(normalizedUrl); // Call extractContent directly
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
  }, [u, setUrl]); // Include setUrl in dependencies

  const extractContent = async (inputUrl) => {
    console.log("extractContent called with:", inputUrl); // Debug log
    setLoading(true);
    try {
      // Check IndexedDB first
      const cachedArticle = await getArticle(inputUrl);
      if (cachedArticle) {
        console.log("Loaded from cache:", cachedArticle);
        setContent(cachedArticle);
        setReadingTime(cachedArticle.readingTime);
        const articles = await getAllArticles();
        setUrlHistory(articles);
        return;
      }

      // Only fetch if online
      if (isOffline) {
        console.log("Offline, cannot fetch new article");
        toast.error(
          "You are offline. Please connect to the internet to fetch new articles.",
          { className: "bg-secondary text-foreground" }
        );
        return;
      }

      console.log("Fetching from API:", inputUrl);
      const response = await fetch("/api/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });
      const data = await response.json();
      if (data.success) {
        console.log("API success:", data.data);
        setContent(data.data);
        setReadingTime(data.data.readingTime);
        setUrl(""); // Clear input field
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

  const handleSubmit = () => {
    console.log("handleSubmit called with url:", url); // Debug log
    if (!url.trim()) {
      console.log("URL is empty, exiting handleSubmit");
      return;
    }
    try {
      new URL(url); // Validate URL format
      console.log("Valid URL, calling extractContent");
      extractContent(url);
    } catch (error) {
      console.error("Invalid URL:", url, error);
      toast.error("Please enter a valid URL.", {
        className: "bg-secondary text-foreground",
      });
    }
  };

  const handleHistoryClick = (historyUrl) => {
    setUrl(historyUrl);
    extractContent(historyUrl);
  };

  const handleClearHistoryItem = async (urlToRemove) => {
    const deleted = await deleteArticle(urlToRemove);
    if (deleted) {
      const articles = await getAllArticles();
      setUrlHistory(articles);
      toast("Article removed from history");
    } else {
      toast("Failed to remove article from history");
    }
  };

  const handleClearAllHistory = async () => {
    const cleared = await clearArticles();
    if (cleared) {
      setUrlHistory([]);
      toast("History cleared");
    } else {
      toast("Failed to clear history");
    }
  };

  const getDateAndTime = (publishDate) => {
    if (!publishDate) return null;
    const date = new Date(publishDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`;
  };

  const decodeTitle = (title) => {
    return he.decode(title);
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
            <div className="py-12">
              <span className="mb-12 text-xs text-foreground/60 font-bold uppercase">
                ZERO ADS | NO POP-UPS | ONLY CONTENT
              </span>
              <h2 className="text-5xl lg:text-7xl font-semibold my-4 tracking-tighter font-serif">
                Read Without{" "}
                <span className="border-yellow-300">Distractions</span>
              </h2>
              <p className="text-lg text-gray-600">
                Enter a URL to convert web content into a beautiful reading
                experience
              </p>
              {isOffline && (
                <p className="text-sm text-yellow-600 mt-2">
                  <HardDrive className="inline w-4 h-4 mr-1" />
                  You are offline. Showing cached articles.
                </p>
              )}
            </div>

            <div className="max-w-md mx-auto">
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full pl-12 pr-16 text-foreground/90 placeholder:text-foreground/30 py-6 rounded-full border border-border focus-visible:ring-0 transition-all duration-300"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  disabled={isOffline}
                />
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  disabled={loading || isOffline}
                  className="absolute right-1 top-1 w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </Button>
              </div>
            </div>

            {/* History Section */}
            {urlHistory.length > 0 && (
              <section className="mt-12">
                <div className="flex justify-between items-center my-8">
                  <h3 className="text-lg font-semibold text-foreground">
                    Recent Articles
                  </h3>
                  <Button
                    variant="secondary"
                    onClick={handleClearAllHistory}
                    className="text-sm text-gray-500 hover:text-red-700 cursor-pointer rounded-full"
                  >
                    Clear History
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {urlHistory.map((item, index) => (
                    <Card
                      key={index}
                      className="group py-0 relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg bg-card border-border"
                      onClick={() => handleHistoryClick(item.url)}
                    >
                      <CardContent className="p-0">
                        {/* Image Container */}
                        {item.image ? (
                          <div className="relative overflow-hidden h-48">
                            <img
                              src={item.image}
                              alt={item.title}
                              onError={(e) => {
                                e.target.src = "/dummy.png";
                              }}
                              className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        ) : (
                          <div className="relative overflow-hidden">
                            <img
                              src={"/dummy.png"}
                              alt={item.title}
                              className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-4 text-left">
                          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 leading-tight">
                            {item.title}
                          </h3>

                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                            <span>By {item.author}</span>
                            <span>{getDateAndTime(item.publishDate)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground/80 bg-muted px-2 py-1 rounded-full">
                              cached
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearHistoryItem(item.url);
                          }}
                          className="absolute top-2 right-2 rounded-full bg-background shadow-sm hover:text-red-700 text-foreground transition-all duration-200 backdrop-blur-sm cursor-pointer text-sm"
                        >
                          <X size={14} className="w-4 h-4" /> clear
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            <section className="py-18">
              <div className="border-4 border-border h-[40rem] rounded-xl p-8 space-y-6">
                <section className="max-w-lg mx-auto space-y-6">
                  <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <div className="w-12 h-12 bg-secondary rounded-full p-4"></div>
                  </div>
                  <div className="max-w-2xl mx-auto space-y-3">
                    <div className="w-full p-1 bg-secondary rounded-full"></div>
                    <div className="w-full p-1 bg-secondary rounded-full"></div>
                    <div className="w-[30vw] p-1 bg-secondary rounded-full"></div>
                    <div className="w-[20vw] p-1 bg-secondary rounded-full"></div>
                    <div className="w-[10vw] p-1 bg-secondary rounded-full"></div>
                  </div>
                  <div className="max-w-2xl mx-auto space-y-3">
                    <div className="w-full p-1 bg-secondary rounded-full"></div>
                    <div className="w-full p-1 bg-secondary rounded-full"></div>
                    <div className="w-[30vw] p-1 bg-secondary rounded-full"></div>
                    <div className="w-[20vw] p-1 bg-secondary rounded-full"></div>
                    <div className="w-[10vw] p-1 bg-secondary rounded-full"></div>
                  </div>
                  <div className="max-w-2xl mx-auto space-y-3">
                    <div className="w-full p-1 bg-secondary rounded-full"></div>
                    <div className="w-full p-1 bg-secondary rounded-full"></div>
                    <div className="w-[30vw] p-1 bg-secondary rounded-full"></div>
                    <div className="w-[20vw] p-1 bg-secondary rounded-full"></div>
                    <div className="w-[10vw] p-1 bg-secondary rounded-full"></div>
                  </div>
                  <div className="max-w-2xl mx-auto space-y-3">
                    <div className="w-full p-1 bg-secondary rounded-full"></div>
                    <div className="w-full p-1 bg-secondary rounded-full"></div>
                    <div className="w-[30vw] p-1 bg-secondary rounded-full"></div>
                    <div className="w-[20vw] p-1 bg-secondary rounded-full"></div>
                    <div className="w-[10vw] p-1 bg-secondary rounded-full"></div>
                  </div>
                </section>
              </div>
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
                {decodeTitle(content.title)} {/* Decode title */}
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

export default SearchInput;
