
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function NewsVisibilityButton({
  newsId,
  status,
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isArchived = status === "archived";

  const handleToggle = async () => {
    const action = isArchived ? "show" : "hide";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this article?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/admin/news/${newsId}/archive`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update article visibility"
        );
      }

      // Refresh the Server Component.
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("News visibility error:", error);

      setError(
        error.message ||
          "Failed to update article visibility"
      );
    }
  };

  return (
    <div className="relative flex flex-col items-end gap-1">
  <button
    type="button"
    onClick={handleToggle}
    disabled={isPending}
    title={
      isArchived
        ? "Show article"
        : "Hide article"
    }
    aria-label={
      isArchived
        ? "Show article"
        : "Hide article"
    }
    className={`
      group relative inline-flex h-9 w-9
      items-center justify-center
      rounded-lg border
      bg-white
      transition-all duration-200
      focus:outline-none
      focus:ring-2
      focus:ring-offset-1
      disabled:cursor-not-allowed
      disabled:opacity-50
      ${
        isArchived
          ? "border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus:ring-emerald-500"
          : "border-gray-200 text-gray-500 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 focus:ring-orange-500"
      }
    `}
  >
    {isPending ? (
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          className="stroke-current opacity-25"
          strokeWidth="3"
        />

        <path
          d="M21 12a9 9 0 0 1-9 9"
          className="stroke-current"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ) : isArchived ? (
      /* Eye - Show */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-[18px] w-[18px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
        />

        <circle
          cx="12"
          cy="12"
          r="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      /* Eye Off - Hide */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-[18px] w-[18px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.58 10.58a2 2 0 0 0 2.83 2.83"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.88 5.24A10.6 10.6 0 0 1 12 5.03c6 0 9.75 6.97 9.75 6.97a16.5 16.5 0 0 1-3.05 3.87"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.61 6.6C3.96 8.37 2.25 12 2.25 12s3.75 6.97 9.75 6.97c1.3 0 2.5-.26 3.57-.7"
        />
      </svg>
    )}

    {/* Tooltip */}
    {!isPending && (
      <span
        className="
          pointer-events-none absolute
          right-0 top-full z-50 mt-2
          whitespace-nowrap
          rounded-md bg-gray-900
          px-2.5 py-1.5
          text-xs font-medium text-white
          opacity-0 shadow-lg
          transition-opacity duration-150
          group-hover:opacity-100
        "
      >
        {isArchived
          ? "Show article"
          : "Hide article"}
      </span>
    )}
  </button>

  {error && (
    <p className="max-w-[180px] text-right text-xs font-medium text-red-600">
      {error}
    </p>
  )}
</div>
  );
}
