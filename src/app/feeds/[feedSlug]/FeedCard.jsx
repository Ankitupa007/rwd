import Link from "next/link";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const FeedCard = ({ feed, index, handleDeleteFeed }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (url) => {
    setIsDeleting(true);
    try {
      await handleDeleteFeed(url);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      key={index}
      className="w-full grid grid-cols-1 sm:grid-cols-[2fr_1fr] items-center gap-4 border border-border rounded-xl p-4 my-3 bg-card hover:bg-secondary/95 transition-colors duration-200"
      role="article"
      aria-label={`Feed card for ${feed.title}`}
    >
      <Link
        href={`/feeds/${feed.slug}`}
        className="flex items-center gap-3 w-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
        aria-label={`View articles for ${feed.title}`}
      >
        <div className="flex items-center gap-3 py-2">
          <img
            src={feed.favicon}
            alt={`${feed.title} favicon`}
            className="w-10 h-10 rounded-md object-contain"
            loading="lazy"
            onError={(e) => (e.target.src = "/fallback-rss-favicon.png")}
          />
          <div className="flex flex-col justify-start items-start">
            <h4 className="text-base md:text-lg font-semibold text-foreground line-clamp-1">
              {feed.title}
            </h4>
            <span className="text-sm text-muted-foreground">
              {feed.items.length}{" "}
              {feed.items.length === 1 ? "article" : "articles"}
            </span>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-end gap-2">
        <Link href={`/feeds/${feed.slug}`}>
          <Button
            variant="secondary"
            size="sm"
            className="text-sm cursor-pointer font-medium transition-colors h-9 px-3"
            aria-label={`Read articles from ${feed.title}`}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Read Articles</span>
            <span className="sm:hidden">Read articles</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(feed.feedUrl)}
          disabled={isDeleting}
          className={`text-sm h-9 px-3 ${
            isDeleting
              ? "opacity-50 cursor-not-allowed"
              : "text-red-500 cursor-pointer hover:text-red-700 hover:bg-red-50"
          }`}
          aria-label={`Remove ${feed.title} feed`}
        >
          <X className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">
            {isDeleting ? "Removing..." : "Remove"}
          </span>
          <span className="sm:hidden">{isDeleting ? "..." : "Remove"}</span>
        </Button>
      </div>
    </div>
  );
};

export default FeedCard;
