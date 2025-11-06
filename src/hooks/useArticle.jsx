"use client";
import { useState } from "react";
import { getArticle, saveArticle } from "@/lib/indexedDB";
import { toast } from "sonner";

export const useArticle = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  const fetchArticle = async (url, isOffline) => {
    setLoading(true);
    try {
      // Safe cache read
      let cachedArticle = null;
      try {
        cachedArticle = await getArticle(url);
      } catch (err) {
        console.error("getArticle failed:", err);
      }
      if (cachedArticle) {
        if (onSuccess) onSuccess(cachedArticle);
        return cachedArticle;
      }

      if (isOffline) {
        toast.error(
          "You are offline. Please connect to the internet to fetch new articles.",
          { className: "bg-secondary text-foreground" }
        );
        return null;
      }

      const response = await fetch("/api/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      // Check for non-OK responses first
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("Fetch failed, status:", response.status, "body:", text);
        toast.error(`Failed to fetch article (status ${response.status}).`);
        return null;
      }

      // Try to parse JSON and handle empty/invalid JSON
      let data;
      try {
        data = await response.json();
      } catch (err) {
        const bodyText = await response.text().catch(() => "");
        console.error(
          "Failed to parse JSON from /api/article:",
          err,
          "body:",
          bodyText
        );
        toast.error("Invalid response from server when fetching article.");
        return null;
      }

      if (data && data.success) {
        const article = data.data;
        if (onSuccess) onSuccess(article);

        // Save to IndexedDB but do not let save errors break the flow
        try {
          await saveArticle({
            ...article,
            fromCache: false,
            savedAt: Date.now(),
          });
        } catch (err) {
          console.error("saveArticle failed:", err);
          // show non-blocking toast so user knows save failed
          toast.error("Failed to save article to local cache.");
        }

        return article;
      } else {
        console.error("API returned error:", data);
        toast.error(
          `Error: ${data?.error ?? "Unknown error"} (${
            data?.code ?? "no-code"
          })`
        );
        return null;
      }
    } catch (error) {
      console.error("fetchArticle caught error:", error);
      toast.error("Failed to fetch article. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchArticle, loading };
};
