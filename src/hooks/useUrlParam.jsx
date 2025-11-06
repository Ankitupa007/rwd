"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeUrl, isValidUrl } from "@/lib/utils/validators";
import { toast } from "sonner";

export const useUrlParam = (onUrlDetected) => {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("u");

  useEffect(() => {
    if (!urlParam) return;

    const decoded = decodeURIComponent(urlParam);

    if (!decoded.startsWith("http")) {
      toast("Invalid URL");
      return;
    }

    const normalized = normalizeUrl(decoded);

    if (isValidUrl(normalized)) {
      onUrlDetected(normalized);
    }
  }, [urlParam, onUrlDetected]);
};
