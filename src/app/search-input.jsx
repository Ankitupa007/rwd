"use client";
import React, { useState } from 'react';
import { Search, Book, Type, Download, Share2, Bookmark, Eye, Loader, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SearchInput = () => {
  const { url, setUrl, fontFamily, fontSize, readingTime, setReadingTime, content, setContent, loading, setLoading } = useStore()

  const extractContent = async (inputUrl) => {
    setLoading(true);
    const response = await fetch("/api/article", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: inputUrl }),
    });
    const data = await response.json();
    setContent(data.data);
    setReadingTime(data.data.readingTime);
    setLoading(false);
  };

  const handleSubmit = () => {
    if (url.trim()) extractContent(url);
  };



  const getDateAndTime = (publishDate) => {
    if (!content) null
    const date = new Date(content.publishDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`
  }

  return (
    <div className="min-h-screen transition-all duration-500">
      {/* Header */}

      <div className="max-w-6xl mx-auto px-6">
        {/* URL Input */}
        {!content && (
          <div className="text-center py-8">
            <div className="py-12">
              <span className='mb-12 text-xs text-foreground/60 font-bold uppercase'>ZERO ADS | NO POP-UPS | ONLY CONTENT</span>
              <h2 className="text-5xl lg:text-7xl font-semibold my-4 tracking-tighter">
                Read without distractions
              </h2>
              <p className="text-lg text-gray-600 ">
                Enter a URL to convert web content into a beautiful reading experience
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full pl-12 pr-16  text-foreground/90 placeholder:text-foreground/30 py-6 rounded-full border border-border focus-visible:ring-0 transition-all duration-300 "
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button
                  variant={"default"}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="absolute right-1 top-1 w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"
                >
                  {loading ? (<Loader size={16} className='animate-spin' />) : (<ArrowRight size={18} />)}
                </Button>
              </div>
            </div>
            <section className='py-18'>
              <div className='border-4 border-border h-[40rem] rounded-xl p-8 space-y-6 '>
                <section className='max-w-lg mx-auto space-y-6'>
                  <div className='max-w-2xl mx-auto  flex justify-between items-center'>
                    <div className='w-12 h-12 bg-secondary rounded-full p-4'></div>
                    {/* <div className='w-12 h-12 bg-secondary rounded-full p-4'></div> */}
                  </div>
                  <div className='max-w-2xl mx-auto space-y-3'>
                    <div className='w-full p-1 bg-secondary rounded-full'></div>
                    <div className='w-full p-1 bg-secondary rounded-full'></div>
                    <div className='w-[30vw] p-1 bg-secondary rounded-full'></div>
                    <div className='w-[20vw] p-1 bg-secondary rounded-full'></div>
                    <div className='w-[10vw] p-1 bg-secondary rounded-full'></div>
                  </div>
                  <div className='max-w-2xl mx-auto space-y-3'>
                    <div className='w-full p-1 bg-secondary rounded-full'></div>
                    <div className='w-full p-1 bg-secondary rounded-full'></div>
                    <div className='w-[30vw] p-1 bg-secondary rounded-full'></div>
                    <div className='w-[20vw] p-1 bg-secondary rounded-full'></div>
                    <div className='w-[10vw] p-1 bg-secondary rounded-full'></div>
                  </div>
                  <div className='max-w-2xl mx-auto space-y-3'>
                    <div className='w-full p-1 bg-secondary rounded-full'></div>
                    <div className='w-full p-1 bg-secondary rounded-full'></div>
                    <div className='w-[30vw] p-1 bg-secondary rounded-full'></div>
                    <div className='w-[20vw] p-1 bg-secondary rounded-full'></div>
                    <div className='w-[10vw] p-1 bg-secondary rounded-full'></div>
                  </div>
                  <div className='max-w-2xl mx-auto space-y-3'>
                    <div className='w-full p-1 bg-secondary rounded-full'></div>
                    <div className='w-full p-1 bg-secondary rounded-full'></div>
                    <div className='w-[30vw] p-1 bg-secondary rounded-full'></div>
                    <div className='w-[20vw] p-1 bg-secondary rounded-full'></div>
                    <div className='w-[10vw] p-1 bg-secondary rounded-full'></div>
                  </div>
                </section>
              </div>
            </section>
          </div>
        )}

        {/* Loading */}
        {/* {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full ">
              <FileText className="w-8 h-8 text-foreground animate-pulse" />
            </div>
            <p className="text text-gray-600">Preparing article...</p>
          </div>
        )} */}

        {/* Reader View */}
        {content && !loading && (
          <>
            <article className="max-w-3xl mx-auto backdrop-blur-xl rounded-3xl py-8 bg-background">
              <header className="mb-8 pb-6 border-b border-black/10">
                <h1
                  className="text-4xl font-bold mb-4 leading-tight"
                  style={{
                    fontSize: `${fontSize + 8}px`,
                    fontFamily: fontFamily === 'serif'
                      ? 'et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif'
                      : fontFamily === 'sans'
                        ? 'Maison Neue'
                        : 'Monaco, monospace'
                  }}
                >
                  {content.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span>By {content.author}</span>
                  <span>•</span>
                  <span>{getDateAndTime(content.publishDate)}</span>
                  <span>•</span>
                  <span>{readingTime} min read</span>
                  <span>•</span>
                  <span>{content.wordCount} words</span>
                </div>
              </header>

              <div
                className="prose prose-lg dark:prose-invert max-w-none leading-relaxed"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: fontFamily === 'serif'
                    ? 'et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif'
                    : fontFamily === 'sans'
                      ? 'Maison Neue'
                      : 'Monaco, monospace'
                }}
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </article>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
