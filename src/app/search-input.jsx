"use client";
import { useStore } from "@/lib/store";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useHistory } from "@/hooks/useHistory";
import { useArticle } from "@/hooks/useArticle";
import { useMetadata } from "@/hooks/useMetadata";
import { useUrlParam } from "@/hooks/useUrlParam";
import { SearchBar } from "@/components/search/SearchBar";
import { EmptyState } from "@/components/search/EmptyState";
import { PlaceholderSection } from "@/components/search/PlaceholderSection";
import { ArticleView } from "@/components/article/ArticleView";
import { HistorySection } from "@/components/history/HistorySection";
import { LoadingState } from "@/components/common/LoadingState";
import Extension from "@/components/common/Extension";
import FabOverlay from "@/components/common/FabOverlay";
import { isValidUrl } from "@/lib/utils/validators";
import { toast } from "sonner";

const SearchInput = () => {
  const { url, setUrl, content, setContent, setReadingTime } = useStore();

  const isOffline = useOfflineStatus();
  const {
    history,
    removeItem,
    clearAll,
    refreshHistory: loadHistory,
  } = useHistory();

  // Article fetching with callback when article is loaded
  const { fetchArticle, loading } = useArticle((article) => {
    setContent(article);
    setReadingTime(article.readingTime);
    setUrl("");
    loadHistory(); // Refresh history list
  });

  // Update document metadata when content changes
  useMetadata(content);

  // Handle URL parameter from query string (?u=...)
  useUrlParam((normalizedUrl) => {
    setUrl(normalizedUrl);
    fetchArticle(normalizedUrl, isOffline);
  });

  // Handle manual URL submission
  const handleSubmit = () => {
    if (!url.trim()) return;

    if (!isValidUrl(url)) {
      toast.error("Please enter a valid URL.", {
        className: "bg-secondary text-foreground",
      });
      return;
    }
    fetchArticle(url, isOffline);
  };

  // Handle clicking on a history item
  const handleHistoryClick = (historyUrl) => {
    setUrl(historyUrl);
    fetchArticle(historyUrl, isOffline);
  };

  return (
    <div className="min-h-screen transition-all duration-500">
      {/* {content && !loading && <FabOverlay />} */}

      <div className="max-w-6xl mx-auto px-6">
        {/* Loading state */}
        {loading && <LoadingState />}

        {/* Empty state with search bar and history */}
        {!content && !loading && (
          <div className="text-center">
            <EmptyState isOffline={isOffline} />

            <SearchBar
              value={url}
              onChange={setUrl}
              onSubmit={handleSubmit}
              loading={loading}
              disabled={isOffline}
            />

            <Extension />

            {history.length > 0 && (
              <HistorySection
                history={history}
                onItemClick={handleHistoryClick}
                onRemoveItem={removeItem}
                onClearAll={clearAll}
              />
            )}

            <PlaceholderSection />
          </div>
        )}

        {/* Article view */}
        {content && !loading && <ArticleView article={content} />}
      </div>
    </div>
  );
};

export default SearchInput;
