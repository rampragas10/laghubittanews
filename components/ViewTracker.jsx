"use client";

import { useEffect } from "react";

export default function ViewTracker({
  slug,
}) {
  useEffect(() => {
    if (!slug) return;

    fetch(`/api/news/${slug}/view`, {
      method: "POST",
    }).catch(() => {});
  }, [slug]);

  return null;
}