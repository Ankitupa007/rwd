"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader, Search } from "lucide-react";
import { useStore } from "@/lib/store";

export const SearchBar = ({ value, onChange, onSubmit, loading, disabled }) => {
  const { url, setUrl } = useStore();
  return (
    <div className="max-w-md mx-auto">
      <div className="relative max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
        <Input
          type="url"
          autoFocus
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter article URL here..."
          className="w-full pl-12 pr-16 text-foreground/90 placeholder:text-foreground/30 py-6 rounded-full border border-border focus-visible:ring-0 transition-all duration-300"
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          disabled={disabled}
        />
        <Button
          variant="default"
          onClick={onSubmit}
          disabled={loading || disabled}
          className="absolute right-1 top-1 w-auto h-10 flex justify-center items-center rounded-full cursor-pointer"
        >
          {loading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <ArrowRight size={18} />
          )}
        </Button>
      </div>
    </div>
  );
};
