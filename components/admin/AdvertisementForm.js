"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AD_POSITIONS,
  AD_STATUSES,
} from "@/lib/ad-constants";



/*
 * ============================================
 * HELPERS
 * ============================================
 */

function parseResponse(response) {
  return response.text().then((text) => {
    if (!text) {
      throw new Error(
        `Server returned an empty response (${response.status}).`
      );
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("INVALID_JSON_RESPONSE:", text);

      throw new Error(
        `Server returned invalid JSON (${response.status}).`
      );
    }
  });
}

function formatDateTimeLocal(date) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const offset = value.getTimezoneOffset();
  const localDate = new Date(
    value.getTime() - offset * 60 * 1000
  );

  return localDate.toISOString().slice(0, 16);
}

function getInitialImage(initial) {
  if (!initial?.image) {
    return {
      url: "",
      publicId: "",
      alt: "",
    };
  }

  if (typeof initial.image === "string") {
    return {
      url: initial.image,
      publicId: "",
      alt: "",
    };
  }

  return {
    url: initial.image.url || "",
    publicId: initial.image.publicId || "",
    alt: initial.image.alt || "",
  };
}

/*
 * ============================================
 * LABELS
 * ============================================
 */

const POSITION_LABELS = {
  HEADER_TOP: "Header Top",
  HOME_TOP: "Home Top",
  HOME_MIDDLE: "Home Middle",
  HOME_BOTTOM: "Home Bottom",

  NEWS_TOP: "News Top",
  NEWS_MIDDLE: "News Middle",
  NEWS_BOTTOM: "News Bottom",

  CATEGORY_TOP: "Category Top",
  CATEGORY_BOTTOM: "Category Bottom",

  SIDEBAR_TOP: "Sidebar Top",
  SIDEBAR_MIDDLE: "Sidebar Middle",
  SIDEBAR_BOTTOM: "Sidebar Bottom",

  FOOTER_TOP: "Footer Top",
};

const STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

const TARGET_LABELS = {
  _blank: "New Tab",
  _self: "Same Tab",
};

/*
 * ============================================
 * COMPONENT
 * ============================================
 */

export default function AdvertisementForm({
  initial = null,
  mode = "create",
}) {
  const router = useRouter();

  const isEdit = mode === "edit";

  /*
   * ------------------------------------------
   * FORM STATE
   * ------------------------------------------
   */

  const [name, setName] = useState(
    initial?.name || ""
  );

  const [position, setPosition] = useState(
    initial?.position || "HOME_TOP"
  );

  const [status, setStatus] = useState(
    initial?.status || "inactive"
  );

  const [linkUrl, setLinkUrl] = useState(
    initial?.linkUrl || ""
  );

  const [target, setTarget] = useState(
    initial?.target || "_blank"
  );

  const [priority, setPriority] = useState(
    initial?.priority ?? 0
  );

  const [startAt, setStartAt] = useState(
    formatDateTimeLocal(initial?.startAt)
  );

  const [endAt, setEndAt] = useState(
    formatDateTimeLocal(initial?.endAt)
  );

  const [image, setImage] = useState(
    getInitialImage(initial)
  );

  /*
   * ------------------------------------------
   * UI STATE
   * ------------------------------------------
   */

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * ==========================================
   * IMAGE UPLOAD
   * ==========================================
   */

  


const handleImageUpload = async (file) => {
  // =========================================
  // Validate selected file
  // =========================================

  if (!(file instanceof File)) {
    console.error(
      "ADVERTISEMENT_UPLOAD_INVALID_FILE:",
      file
    );

    setError("Please select an image file.");
    return;
  }

  // =========================================
  // Validate type
  // =========================================

 const allowedTypes = [ "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml", ]; if (!allowedTypes.includes(file.type)) { setError( "Allowed formats: JPG, JPEG, PNG, WebP, GIF, AVIF and SVG." ); return; } if (file.size > 10 * 1024 * 1024) { setError("Image must be smaller than 10MB."); return; }

  try {
    setUploading(true);
    setError("");
    setSuccess("");

    // =========================================
    // Create multipart FormData
    // =========================================

    const uploadData = new FormData();

    // IMPORTANT:
    // /api/admin/upload expects "file"
    uploadData.append("file", file);

    console.log("ADVERTISEMENT FILE:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // =========================================
    // Upload to API
    // =========================================

    const response = await fetch(
      "/api/admin/upload",
      {
        method: "POST",
        body: uploadData,
      }
    );

    const data = await response.json();

    console.log(
      "ADVERTISEMENT UPLOAD RESPONSE:",
      data
    );

    // =========================================
    // Handle API error
    // =========================================

    if (!response.ok || !data.success) {
      throw new Error(
        data?.message ||
          "Failed to upload advertisement image."
      );
    }

    // =========================================
    // Save Cloudinary image
    // =========================================

    setImage((current) => ({
      ...current,

      url: data.url || "",
      publicId: data.data?.publicId || "",
    }));

    console.log(
      "ADVERTISEMENT IMAGE UPLOADED:",
      data.url
    );

  } catch (error) {
    console.error(
      "ADVERTISEMENT_IMAGE_UPLOAD_ERROR:",
      error
    );

    setError(
      error.message ||
        "Failed to upload advertisement image."
    );

  } finally {
    setUploading(false);
  }
};




  /*
   * ==========================================
   * REMOVE IMAGE FROM FORM
   * ==========================================
   */

  function removeImage() {
    setImage({
      url: "",
      publicId: "",
      alt: "",
    });
  }

  /*
   * ==========================================
   * VALIDATION
   * ==========================================
   */

  function validateForm() {
    if (!name.trim()) {
      return "Please enter an advertisement name.";
    }

    if (name.trim().length < 2) {
      return "Advertisement name must be at least 2 characters.";
    }

    if (!AD_POSITIONS.includes(position)) {
      return "Please select a valid advertisement position.";
    }

    if (!AD_STATUSES.includes(status)) {
      return "Please select a valid advertisement status.";
    }

    if (!image.url) {
      return "Please upload an advertisement image.";
    }

    if (linkUrl.trim()) {
      try {
        const url = new URL(linkUrl.trim());

        if (
          url.protocol !== "http:" &&
          url.protocol !== "https:"
        ) {
          return "Advertisement URL must use HTTP or HTTPS.";
        }
      } catch {
        return "Please enter a valid advertisement URL.";
      }
    }

    const priorityNumber = Number(priority);

    if (
      !Number.isInteger(priorityNumber) ||
      priorityNumber < 0 ||
      priorityNumber > 100000
    ) {
      return "Priority must be an integer between 0 and 100000.";
    }

    if (startAt && endAt) {
      const start = new Date(startAt);
      const end = new Date(endAt);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return "Please enter valid schedule dates.";
      }

      if (end <= start) {
        return "End date must be after start date.";
      }
    }

    return null;
  }

  /*
   * ==========================================
   * SUBMIT
   * ==========================================
   */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),

        position,

        image: {
          url: image.url,
          publicId: image.publicId || "",
          alt: image.alt.trim(),
        },

        linkUrl: linkUrl.trim(),

        target,

        status,

        priority: Number(priority),

        startAt: startAt
          ? new Date(startAt).toISOString()
          : null,

        endAt: endAt
          ? new Date(endAt).toISOString()
          : null,
      };

      const url = isEdit
        ? `/api/admin/ads/${initial._id}`
        : "/api/admin/ads";

      const method = isEdit
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await parseResponse(response);

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.error?.message ||
            "Failed to save advertisement."
        );
      }

      setSuccess(
        data.message ||
          (
            isEdit
              ? "Advertisement updated successfully."
              : "Advertisement created successfully."
          )
      );

      /*
       * Redirect after a short delay so the
       * success message is visible.
       */

      setTimeout(() => {
        router.push("/admin/ads");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "SAVE_ADVERTISEMENT_ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while saving the advertisement."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* ======================================
          MESSAGES
      ====================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ======================================
          BASIC INFORMATION
      ====================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Configure the advertisement and where it
            should appear.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Name */}

          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Advertisement Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Example: Nabil Bank Homepage Banner"
              maxLength={150}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
            />

            <p className="mt-1 text-xs text-gray-400">
              Internal name used to identify this advertisement.
            </p>
          </div>

          {/* Position */}

          <div>
            <label
              htmlFor="position"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Advertisement Position
            </label>

            <select
              id="position"
              value={position}
              onChange={(event) =>
                setPosition(event.target.value)
              }
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
            >
              {AD_POSITIONS.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {POSITION_LABELS[item] || item}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
            >
              {AD_STATUSES.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {STATUS_LABELS[item] || item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ======================================
          ADVERTISEMENT IMAGE
      ====================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Advertisement Image
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Upload the banner image that visitors will see.
          </p>
        </div>

        <div className="space-y-5">
          {/* Upload */}

          <div>
            <label
              htmlFor="advertisement-image"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Banner Image
            </label>

            <input
              id="advertisement-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
              onChange={(event) => {
                const file =
                  event.target.files?.[0];

                if (file) {
                  handleImageUpload(file);
                }
              }}
              disabled={
                uploading ||
                submitting
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
            />

<p className="mt-2 text-xs text-gray-500"> JPG, JPEG, PNG, WebP, GIF, AVIF or SVG. Maximum 10MB. </p>
          </div>

          {/* Uploading */}

          {uploading && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Uploading image to Cloudinary...
            </div>
          )}

          {/* Preview */}

          {image.url && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                  Preview
                </h3>

                <button
                  type="button"
                  onClick={removeImage}
                  disabled={
                    uploading ||
                    submitting
                  }
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <img
                  src={image.url}
                  alt={
                    image.alt ||
                    name ||
                    "Advertisement preview"
                  }
                  className="max-h-[400px] w-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Alt text */}

          <div>
            <label
              htmlFor="image-alt"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Image Alt Text
            </label>

            <input
              id="image-alt"
              type="text"
              value={image.alt}
              onChange={(event) =>
                setImage((current) => ({
                  ...current,
                  alt: event.target.value,
                }))
              }
              placeholder="Example: Nabil Bank advertisement"
              maxLength={250}
              disabled={
                uploading ||
                submitting
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
            />

            <p className="mt-1 text-xs text-gray-400">
              Describe the advertisement image for accessibility.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================
          LINK
      ====================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Destination
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Configure where visitors go when they click the advertisement.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* URL */}

          <div className="md:col-span-2">
            <label
              htmlFor="link-url"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Destination URL
            </label>

            <input
              id="link-url"
              type="url"
              value={linkUrl}
              onChange={(event) =>
                setLinkUrl(event.target.value)
              }
              placeholder="https://example.com"
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
            />

            <p className="mt-1 text-xs text-gray-400">
              Leave empty if this advertisement should not be clickable.
            </p>
          </div>

          {/* Target */}

          <div>
            <label
              htmlFor="target"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Open Link
            </label>

            <select
              id="target"
              value={target}
              onChange={(event) =>
                setTarget(event.target.value)
              }
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
            >
              <option value="_blank">
                {TARGET_LABELS._blank}
              </option>

              <option value="_self">
                {TARGET_LABELS._self}
              </option>
            </select>
          </div>

          {/* Priority */}

          <div>
            <label
              htmlFor="priority"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Priority
            </label>

            <input
              id="priority"
              type="number"
              min="0"
              max="100000"
              step="1"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
            />

            <p className="mt-1 text-xs text-gray-400">
              Higher priority can be used when multiple ads share a position.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================
          SCHEDULING
      ====================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Schedule
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Optionally control when the advertisement is active.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Start */}

          <div>
            <label
              htmlFor="start-at"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Start Date & Time
            </label>

            <input
              id="start-at"
              type="datetime-local"
              value={startAt}
              onChange={(event) =>
                setStartAt(event.target.value)
              }
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
            />
          </div>

          {/* End */}

          <div>
            <label
              htmlFor="end-at"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              End Date & Time
            </label>

            <input
              id="end-at"
              type="datetime-local"
              value={endAt}
              onChange={(event) =>
                setEndAt(event.target.value)
              }
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
            />
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
          Leave both fields empty for an advertisement without a time window.
        </div>
      </section>

      {/* ======================================
          ACTIONS
      ====================================== */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/ads")}
          disabled={
            submitting ||
            uploading
          }
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            submitting ||
            uploading
          }
          className="rounded-lg bg-[#005b37] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00482c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
              ? "Update Advertisement"
              : "Create Advertisement"}
        </button>
      </div>
    </form>
  );
}
