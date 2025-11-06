import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { HistoryCard } from "./HistoryCard";
import Extension from "@/components/common/Extension";

export const HistorySection = ({
  history,
  onItemClick,
  onRemoveItem,
  onClearAll,
}) => {
  return (
    <section className="mt-8">
      <div className="flex justify-between items-center my-8">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Articles {history.length > 0 && `(${history.length})`}
        </h3>
        <Button
          variant="secondary"
          onClick={onClearAll}
          className="rounded-full bg-accent border-border border hover:border-red-200 dark:hover:border-red-700/20 hover:bg-red-100 dark:hover:bg-red-800/20 text-red-400 transition-all duration-200 backdrop-blur-lg cursor-pointer text-sm"
        >
          <X size={14} className="w-4 h-4" />
          Clear history
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {history.map((item, index) => (
          <div key={index}>
            <HistoryCard
              onClick={() => onItemClick(item.url)}
              item={item}
              onRemove={onRemoveItem}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
