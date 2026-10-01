"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ slug }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!slug) return;

    if (hasTracked.current) {
      return;
    }

    hasTracked.current = true;

    async function trackView() {
      try {
        console.log(
          "TRACKING VIEW FOR:",
          slug
        );

        const response = await fetch(
          `/api/news/${encodeURIComponent(slug)}/view`,
          {
            method: "POST",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        console.log(
          "VIEW API RESPONSE:",
          {
            status: response.status,
            data,
          }
        );

        if (!response.ok) {
          console.error(
            "VIEW TRACKING FAILED:",
            data
          );
          return;
        }

        console.log(
          "VIEW TRACKED SUCCESSFULLY:",
          data.views
        );
      } catch (error) {
        console.error(
          "VIEW TRACKING ERROR:",
          error
        );
      }
    }

    trackView();
  }, [slug]);

  return null;
}