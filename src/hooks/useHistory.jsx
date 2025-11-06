"use client";
import { useState, useEffect } from "react";
import { getAllArticles, deleteArticle, clearArticles } from "@/lib/indexedDB";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

export const useHistory = () => {
  const [history, setHistory] = useState([]);
  const { content } = useStore();
  const loadHistory = async () => {
    const articles = await getAllArticles();
    setHistory(articles);
  };

  useEffect(() => {
    loadHistory();
  }, [content]);

  const removeItem = async (url) => {
    const deleted = await deleteArticle(url);
    if (deleted) {
      await loadHistory();
      toast("Article removed from history");
    } else {
      toast("Failed to remove article from history");
    }
  };

  const clearAll = async () => {
    const cleared = await clearArticles();
    if (cleared) {
      setHistory([]);
      toast("History cleared");
    } else {
      toast("Failed to clear history");
    }
  };

  return { history, removeItem, clearAll, refreshHistory: loadHistory };
};
