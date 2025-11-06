// components/article/ArticleView.jsx
"use client";
import { useStore } from "@/lib/store";
import { decodeHtmlEntities } from "@/lib/utils/textUtils";
import { formatDateTime } from "@/lib/utils/formatters";
import Extension from "@/components/common/Extension";

export const ArticleView = ({ article }) => {
  const { fontFamily, fontSize, readingTime } = useStore();

  const getFontFamily = () => {
    if (fontFamily === "serif")
      return 'et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif';
    if (fontFamily === "sans") return "Maison Neue";
    return "Monaco, monospace";
  };

  return (
    <article className="max-w-3xl mx-auto backdrop-blur-xl rounded-3xl py-8 bg-background">
      {/* Article Header */}
      <header className="mb-8 pb-6 border-b border-black/10">
        <h1
          className="text-4xl font-bold mb-4 leading-tight"
          style={{
            fontSize: `${fontSize + 16}px`,
            fontFamily: getFontFamily(),
          }}
        >
          {decodeHtmlEntities(article.title)}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
          <span>By {article.author}</span>
          <span>•</span>
          <span>{formatDateTime(article.publishDate)}</span>
          <span>•</span>
          <span>{readingTime} min read</span>
          <span>•</span>
          <span>{article.wordCount} words</span>
          {article.fromCache && (
            <>
              <span>•</span>
              <span className="text-blue-500">Loaded from cache</span>
            </>
          )}
        </div>
      </header>

      {/* Article Image */}
      {article.image && (
        <div className="relative overflow-hidden h-full mb-8">
          <img
            src={article.image}
            alt={decodeHtmlEntities(article.title)}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 rounded-lg"
            onError={(e) => (e.target.style.display = "none")}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      )}

      {/* Article Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none leading-relaxed"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: getFontFamily(),
        }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <Extension />
    </article>
  );
};
