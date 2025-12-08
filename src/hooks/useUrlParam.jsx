"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeUrl, isValidUrl } from "@/lib/utils/validators";
import { toast } from "sonner";

export const useUrlParam = (onUrlDetected) => {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("u");
  const processedUrlRef = useRef(null);

  useEffect(() => {
    if (!urlParam) return;

    const decoded = decodeURIComponent(urlParam);

    // Prevent processing the same URL multiple times
    if (processedUrlRef.current === decoded) {
      return;
    }

    if (!decoded.startsWith("http")) {
      toast("Invalid URL");
      return;
    }

    const normalized = normalizeUrl(decoded);

    if (isValidUrl(normalized)) {
      processedUrlRef.current = decoded;
      onUrlDetected(normalized);
    }
  }, [urlParam, onUrlDetected]);
};
