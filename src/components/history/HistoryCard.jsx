import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";

export const HistoryCard = ({ item, onClick, onRemove }) => {
  return (
    <Card
      className="group rounded-3xl py-0 relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg bg-card border-border"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Image Container */}
        {item.image ? (
          <div className="relative overflow-hidden h-48">
            <img
              src={item.image || "/dummy.png"}
              alt={item.title}
              onError={(e) => {
                e.target.src = "/dummy.png";
              }}
              className="w-full h-54 object-cover transition-transform duration-200 group-hover:scale-105"
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
        <div className="px-4 py-8 text-left">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 leading-tight">
            {item.title}
          </h3>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>By {item.author}</span>
          </div>
        </div>

        <div className="absolute bottom-2 px-3 flex items-center w-full justify-between">
          <span className="text-xs font-mono text-muted-foreground/80 bg-muted px-2 py-1 rounded-full">
            {item.feedName ? `rss: ${item.feedName}` : "cached"}
          </span>
          <span className="flex font-mono items-center justify-between text-xs text-muted-foreground">
            {formatDateTime(item.publishDate)}
          </span>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.url);
          }}
          className="absolute top-2 right-2 rounded-full bg-accent hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-800/20 text-red-400 transition-all duration-200 backdrop-blur-lg cursor-pointer text-sm"
        >
          <X size={14} className="w-4 h-4" /> clear
        </Button>
      </CardContent>
    </Card>
  );
};
