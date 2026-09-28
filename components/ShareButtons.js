
"use client";

import { useState } from "react";

export default function ShareButtons({
  url,
  title,
  description = "",
}) {
  const [copied, setCopied] = useState(false);

  // =========================================
  // Facebook
  // =========================================

  function shareFacebook() {
    const shareUrl =
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`;

    window.open(
      shareUrl,
      "_blank",
      "width=600,height=500"
    );
  }

  // =========================================
  // X / Twitter
  // =========================================

  function shareTwitter() {
    const shareUrl =
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`;

    window.open(
      shareUrl,
      "_blank",
      "width=600,height=500"
    );
  }

  // =========================================
  // WhatsApp
  // =========================================

  function shareWhatsApp() {
    const text =
      `${title}\n\n${url}`;

    const shareUrl =
      `https://wa.me/?text=${encodeURIComponent(
        text
      )}`;

    window.open(
      shareUrl,
      "_blank"
    );
  }

  // =========================================
  // Copy Link
  // =========================================

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy link:",
        error
      );
    }
  }

  // =========================================
  // Native Share
  // =========================================

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title,
        text: description || title,
        url,
      });
    } catch (error) {
      // User cancelled share dialog.
      if (error?.name !== "AbortError") {
        console.error(
          "Share failed:",
          error
        );
      }
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* =========================
            Label
        ========================== */}

        <div>
          <p className="text-sm font-semibold text-gray-900">
            Share this article
          </p>

          <p className="text-xs text-gray-500">
            यो समाचार शेयर गर्नुहोस्
          </p>
        </div>

        {/* =========================
            Buttons
        ========================== */}

        <div className="flex flex-wrap gap-2">

          {/* Facebook */}

          <button
            type="button"
            onClick={shareFacebook}
            className="rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Facebook
          </button>

          {/* X */}

          <button
            type="button"
            onClick={shareTwitter}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            X
          </button>

          {/* WhatsApp */}

          <button
            type="button"
            onClick={shareWhatsApp}
            className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            WhatsApp
          </button>

          {/* Copy */}

          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-300"
          >
            {copied
              ? "Copied!"
              : "Copy Link"}
          </button>

          {/* Native Share */}

          <button
            type="button"
            onClick={nativeShare}
            className="rounded-lg bg-[#005b37] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Share
          </button>

        </div>

      </div>

    </div>
  );
}
