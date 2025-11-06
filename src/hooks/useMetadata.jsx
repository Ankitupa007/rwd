"use client";
import { useEffect } from "react";
import { decodeHtmlEntities } from "@/lib/utils/textUtils";

const setMeta = (name, value) => {
  let el =
    document.querySelector(`meta[name='${name}']`) ||
    document.querySelector(`meta[property='${name}']`);

  if (!el) {
    el = document.createElement("meta");
    if (name.startsWith("og:") || name.startsWith("twitter:")) {
      el.setAttribute("property", name);
    } else {
      el.setAttribute("name", name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
};

export const useMetadata = (content) => {
  useEffect(() => {
    if (!content?.title) return;

    const decodedTitle = decodeHtmlEntities(
      content.metaDataTitle || content.title
    );
    const description =
      content.excerpt || "Read this article distraction-free.";

    document.title = decodedTitle;
    setMeta("description", description);
    setMeta("og:title", decodedTitle);
    setMeta("og:description", description);
    setMeta("twitter:title", decodedTitle);
    setMeta("twitter:description", description);
  }, [content]);
};
