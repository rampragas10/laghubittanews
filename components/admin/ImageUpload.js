"use client";

import { useRef, useState } from "react";

export default function ImageUpload({
  value,
  onChange,
}) {
  const inputRef = useRef(null);

  const [preview, setPreview] = useState(
    value?.url || ""
  );

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setError("");
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/admin/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Image upload failed"
        );
      }

      const imageData = {
        url: result.data.url,
        publicId: result.data.publicId,
      };

      setPreview(result.data.url);

      onChange(imageData);
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      setError(error.message);
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeImage = () => {
    setPreview("");

    onChange({
      url: "",
      publicId: "",
    });
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <img
            src={preview}
            alt="News cover preview"
            className="h-64 w-full object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-3">
            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              disabled={uploading}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100 disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : "Change image"}
            </button>

            <button
              type="button"
              onClick={removeImage}
              disabled={uploading}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          disabled={uploading}
          className="flex h-64 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-[#005b37] hover:bg-green-50/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#005b37]" />

              <span className="text-sm font-medium text-gray-700">
                Uploading image...
              </span>
            </>
          ) : (
            <>
              <svg
                className="mb-3 h-10 w-10 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5V7.75A2.75 2.75 0 015.75 5h12.5A2.75 2.75 0 0121 7.75v8.5A2.75 2.75 0 0118.25 19H5.75A2.75 2.75 0 013 16.5Z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m3.5 16 5-5 3.5 3.5 2.5-2.5 6 6"
                />

                <circle
                  cx="16.5"
                  cy="9"
                  r="1.5"
                />
              </svg>

              <span className="text-sm font-semibold text-gray-700">
                Upload cover image
              </span>

              <span className="mt-1 text-xs text-gray-500">
                JPG, PNG or WebP • Maximum 5MB
              </span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}