
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";

const RichTextEditor = dynamic(
  () => import("./RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border p-4 text-gray-500">
        Loading editor...
      </div>
    ),
  }
);

export default function NewsForm({
  initial = null,
  categories = [],
}) {
  const router = useRouter();

  const isEdit = Boolean(initial?._id);

  // ============================================
  // FORM STATE
  // ============================================

  const [title, setTitle] = useState(
    initial?.title || ""
  );

  const [excerpt, setExcerpt] = useState(
    initial?.excerpt || ""
  );

  const [content, setContent] = useState(
    initial?.content || ""
  );

  const [coverImage, setCoverImage] = useState(
    initial?.coverImage || ""
  );

  const [imageAlt, setImageAlt] = useState(
    initial?.imageAlt || ""
  );

  /*
   * IMPORTANT:
   * initial.categories can contain:
   *
   * ObjectId strings
   * OR populated category objects
   */
  const [selectedCategories, setSelectedCategories] =
    useState(
      Array.isArray(initial?.categories)
        ? initial.categories
            .map((category) =>
              typeof category === "string"
                ? category
                : category?._id?.toString()
            )
            .filter(Boolean)
        : []
    );

  const [tags, setTags] = useState(
    Array.isArray(initial?.tags)
      ? initial.tags.join(", ")
      : ""
  );

  const [galleryImages, setGalleryImages] =
    useState(
      Array.isArray(initial?.images)
        ? initial.images
        : []
    );

  const [featured, setFeatured] = useState(
    Boolean(initial?.featured)
  );

  const [breaking, setBreaking] = useState(
    Boolean(initial?.breaking)
  );

  const [readTime, setReadTime] = useState(
    initial?.readTime || 3
  );

  const [scheduledAt, setScheduledAt] =
    useState(
      initial?.scheduledAt
        ? formatDateTimeLocal(
            initial.scheduledAt
          )
        : ""
    );

  const [submitting, setSubmitting] =
    useState(false);

  const [submittingAction, setSubmittingAction] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  // ============================================
  // CATEGORY
  // ============================================

  function toggleCategory(categoryId) {
    const id = String(categoryId);

    setSelectedCategories((current) => {
      if (current.includes(id)) {
        return current.filter(
          (item) => item !== id
        );
      }

      return [...current, id];
    });
  }

  // ============================================
  // SAFE JSON RESPONSE
  // ============================================

  async function parseResponse(response) {
    const text = await response.text();

    if (!text) {
      throw new Error(
        `Server returned an empty response (${response.status}).`
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error(
        "INVALID JSON RESPONSE:",
        text
      );

      throw new Error(
        `Server returned invalid JSON (${response.status}).`
      );
    }

    return data;
  }

  // ============================================
  // COVER IMAGE UPLOAD
  // ============================================

  async function uploadCoverImage(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      /*
       * IMPORTANT:
       * Upload API expects "upload"
       */
      formData.append("upload", file);

      const response = await fetch(
        "/api/admin/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await parseResponse(response);

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.error?.message ||
            "Failed to upload cover image."
        );
      }

      setCoverImage(data.url);
    } catch (error) {
      console.error(
        "COVER_UPLOAD_ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to upload image."
      );
    } finally {
      event.target.value = "";
    }
  }

  // ============================================
  // GALLERY UPLOAD
  // ============================================

  async function uploadGalleryImages(event) {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    setError("");
    setSuccess("");

    try {
      const uploadedImages = [];

      for (const file of files) {
        const formData = new FormData();

        /*
         * IMPORTANT:
         * Upload API expects "upload"
         */
        formData.append(
          "upload",
          file
        );

        const response = await fetch(
          "/api/admin/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data =
          await parseResponse(response);

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data?.error?.message ||
              "Failed to upload gallery image."
          );
        }

        uploadedImages.push({
          url: data.url,
          alt: "",
          caption: "",
        });
      }

      setGalleryImages((current) => [
        ...current,
        ...uploadedImages,
      ]);
    } catch (error) {
      console.error(
        "GALLERY_UPLOAD_ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to upload gallery images."
      );
    } finally {
      event.target.value = "";
    }
  }

  // ============================================
  // REMOVE GALLERY IMAGE
  // ============================================

  function removeGalleryImage(index) {
    setGalleryImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  }

  // ============================================
  // UPDATE GALLERY IMAGE
  // ============================================

  function updateGalleryImage(
    index,
    field,
    value
  ) {
    setGalleryImages((current) =>
      current.map(
        (image, imageIndex) => {
          if (imageIndex !== index) {
            return image;
          }

          return {
            ...image,
            [field]: value,
          };
        }
      )
    );
  }

  // ============================================
  // SUBMIT
  // ============================================

  async function submitForm(action) {
    setError("");
    setSuccess("");

    // ------------------------------------------
    // Validation
    // ------------------------------------------

    if (!title.trim()) {
      setError(
        "Please enter a news title."
      );
      return;
    }

    if (!content.trim()) {
      setError(
        "Please enter news content."
      );
      return;
    }

    if (
      selectedCategories.length === 0
    ) {
      setError(
        "Please select at least one category."
      );
      return;
    }

    if (
      action === "scheduled" &&
      !scheduledAt
    ) {
      setError(
        "Please select a date and time for scheduling."
      );
      return;
    }

    setSubmitting(true);
    setSubmittingAction(action);

    try {
      const formData = new FormData();

      // ----------------------------------------
      // Basic fields
      // ----------------------------------------

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "excerpt",
        excerpt.trim()
      );

      formData.append(
        "content",
        content
      );

      formData.append(
        "coverImage",
        coverImage
      );

      formData.append(
        "imageAlt",
        imageAlt.trim()
      );

      // ----------------------------------------
      // Categories
      // ----------------------------------------
      // API expects JSON array
      //
      // Example:
      // ["68abc...", "68def..."]
      // ----------------------------------------
selectedCategories.forEach((categoryId) => {
  formData.append(
    "categories",
    String(categoryId)
  );
});

      // ----------------------------------------
      // Tags
      // ----------------------------------------

      const parsedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      formData.append(
        "tags",
        JSON.stringify(parsedTags)
      );

      // ----------------------------------------
      // Gallery
      // ----------------------------------------
      // API expects "images"
      // ----------------------------------------

      formData.append(
        "images",
        JSON.stringify(
          galleryImages
        )
      );

      // ----------------------------------------
      // Metadata
      // ----------------------------------------

      formData.append(
        "featured",
        String(featured)
      );

      formData.append(
        "breaking",
        String(breaking)
      );

      formData.append(
        "readTime",
        String(readTime)
      );

      // ----------------------------------------
      // STATUS
      // ----------------------------------------

      formData.append(
        "status",
        action
      );

      // ----------------------------------------
      // SCHEDULE
      // ----------------------------------------

      if (action === "scheduled") {
        formData.append(
          "scheduledAt",
          scheduledAt
        );
      }

      // ----------------------------------------
      // API URL
      // ----------------------------------------

      const url = isEdit
        ? `/api/admin/news/${initial._id}`
        : "/api/admin/news";

      const method = isEdit
        ? "PUT"
        : "POST";

      // ----------------------------------------
      // REQUEST
      // ----------------------------------------

      const response = await fetch(
        url,
        {
          method,
          body: formData,
        }
      );

      const data =
        await parseResponse(response);

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.error?.message ||
            "Failed to save news."
        );
      }

      setSuccess(
        data.message ||
          "News saved successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/news"
        );

        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "SAVE_NEWS_ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setSubmitting(false);
      setSubmittingAction(null);
    }
  }

  // ============================================
  // DELETE
  // ============================================

  async function deleteNews() {
    if (!isEdit) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this article?"
      );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/news/${initial._id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await parseResponse(response);

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.error?.message ||
            "Failed to delete article."
        );
      }

      router.push(
        "/admin/news"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "DELETE_NEWS_ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to delete article."
      );
    } finally {
      setDeleting(false);
    }
  }

  // ============================================
  // UI
  // ============================================

  return (
    <div className="space-y-8">

      {/* ====================================== */}
      {/* MESSAGES */}
      {/* ====================================== */}

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

      {/* ====================================== */}
      {/* BASIC INFORMATION */}
      {/* ====================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-bold">
          Basic Information
        </h2>

        <div className="space-y-5">

          {/* Title */}

          <div>
            <label className="mb-2 block font-semibold">
              Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Enter news title"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Excerpt */}

          <div>
            <label className="mb-2 block font-semibold">
              Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(event) =>
                setExcerpt(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Short summary of the article"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Content */}

          <div>
            <label className="mb-2 block font-semibold">
              Content *
            </label>

            <RichTextEditor
              value={content}
              onChange={setContent}
            />
          </div>

        </div>
      </section>

      {/* ====================================== */}
      {/* CATEGORIES */}
      {/* ====================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-bold">
          Categories *
        </h2>

        {categories.length === 0 ? (
          <p className="text-sm text-red-600">
            No active categories found.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">

          {categories.map((category) => {
  const categoryId = String(category._id);

  return (
    <label
      key={categoryId}
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
    >
      <input
        type="checkbox"
        value={categoryId}
        checked={selectedCategories.includes(
          categoryId
        )}
        onChange={(event) => {
          if (event.target.checked) {
            setSelectedCategories((prev) => [
              ...new Set([
                ...prev,
                categoryId,
              ]),
            ]);
          } else {
            setSelectedCategories((prev) =>
              prev.filter(
                (id) => id !== categoryId
              )
            );
          }
        }}
        className="h-4 w-4"
      />

      <div>
        <p className="font-medium text-gray-900">
          {category.name}
        </p>

        {category.description && (
          <p className="text-xs text-gray-500">
            {category.description}
          </p>
        )}
      </div>
    </label>
  );
})}

          </div>
        )}

      </section>

      {/* ====================================== */}
      {/* IMAGES */}
      {/* ====================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-bold">
          Images
        </h2>

        <div className="space-y-6">

          {/* Cover */}

          <div>

            <label className="mb-2 block font-semibold">
              Cover Image
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={
                uploadCoverImage
              }
              className="w-full rounded-lg border p-3"
            />

            {coverImage && (
              <div className="mt-4">

                <img
                  src={coverImage}
                  alt={
                    imageAlt ||
                    "Cover image"
                  }
                  className="h-56 w-full rounded-lg object-cover"
                />

              </div>
            )}

          </div>

          {/* Alt */}

          <div>

            <label className="mb-2 block font-semibold">
              Image Alt Text
            </label>

            <input
              type="text"
              value={imageAlt}
              onChange={(event) =>
                setImageAlt(
                  event.target.value
                )
              }
              placeholder="Describe the cover image"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            />

          </div>

          {/* Gallery */}

          <div>

            <label className="mb-2 block font-semibold">
              Gallery Images
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={
                uploadGalleryImages
              }
              className="w-full rounded-lg border p-3"
            />

            {galleryImages.length > 0 && (
              <div className="mt-5 grid gap-4 md:grid-cols-3">

                {galleryImages.map(
                  (image, index) => (
                    <div
                      key={`${image.url}-${index}`}
                      className="rounded-lg border p-3"
                    >

                      <img
                        src={image.url}
                        alt={
                          image.alt || ""
                        }
                        className="mb-3 h-40 w-full rounded object-cover"
                      />

                      <input
                        type="text"
                        value={
                          image.alt || ""
                        }
                        onChange={(event) =>
                          updateGalleryImage(
                            index,
                            "alt",
                            event.target.value
                          )
                        }
                        placeholder="Alt text"
                        className="mb-2 w-full rounded border px-3 py-2 text-sm"
                      />

                      <input
                        type="text"
                        value={
                          image.caption ||
                          ""
                        }
                        onChange={(event) =>
                          updateGalleryImage(
                            index,
                            "caption",
                            event.target.value
                          )
                        }
                        placeholder="Caption"
                        className="mb-2 w-full rounded border px-3 py-2 text-sm"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeGalleryImage(
                            index
                          )
                        }
                        className="w-full rounded border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>
      </section>

      {/* ====================================== */}
      {/* METADATA */}
      {/* ====================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-bold">
          Metadata
        </h2>

        <div className="space-y-5">

          {/* Tags */}

          <div>

            <label className="mb-2 block font-semibold">
              Tags
            </label>

            <input
              type="text"
              value={tags}
              onChange={(event) =>
                setTags(
                  event.target.value
                )
              }
              placeholder="microfinance, Nepal, banking"
              className="w-full rounded-lg border px-4 py-3"
            />

            <p className="mt-1 text-sm text-gray-500">
              Separate tags using commas.
            </p>

          </div>

          {/* Read Time */}

          <div>

            <label className="mb-2 block font-semibold">
              Read Time (minutes)
            </label>

            <input
              type="number"
              min="1"
              value={readTime}
              onChange={(event) =>
                setReadTime(
                  Number(
                    event.target.value
                  )
                )
              }
              className="w-full rounded-lg border px-4 py-3"
            />

          </div>

          {/* Featured / Breaking */}

          <div className="flex flex-wrap gap-6">

            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                checked={featured}
                onChange={(event) =>
                  setFeatured(
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              <span className="font-medium">
                Featured News
              </span>

            </label>

            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                checked={breaking}
                onChange={(event) =>
                  setBreaking(
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              <span className="font-medium">
                Breaking News
              </span>

            </label>

          </div>

        </div>
      </section>

      {/* ====================================== */}
      {/* SCHEDULE */}
      {/* ====================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-2 text-xl font-bold">
          Schedule
        </h2>

        <p className="mb-5 text-sm text-gray-500">
          Select a future Nepal time when
          the article should automatically
          become published.
        </p>

        <div>

          <label className="mb-2 block font-semibold">
            Publish Date & Time
          </label>

          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) =>
              setScheduledAt(
                event.target.value
              )
            }
            className="rounded-lg border px-4 py-3 outline-none focus:border-green-600"
          />

          <p className="mt-2 text-sm text-gray-500">
            Timezone: Asia/Kathmandu
            (UTC+05:45)
          </p>

        </div>

      </section>

      {/* ====================================== */}
      {/* PUBLISHING */}
      {/* ====================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-2 text-xl font-bold">
          Publishing
        </h2>

        <p className="mb-6 text-sm text-gray-500">
          Choose how you want to save this
          article.
        </p>

        <div className="flex flex-wrap gap-4">

          {/* Draft */}

          <button
            type="button"
            disabled={
              submitting ||
              deleting
            }
            onClick={() =>
              submitForm("draft")
            }
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submittingAction ===
            "draft"
              ? "Saving..."
              : "Save Draft"}
          </button>

          {/* Schedule */}

          <button
            type="button"
            disabled={
              submitting ||
              deleting
            }
            onClick={() =>
              submitForm("scheduled")
            }
            className="rounded-lg border border-blue-300 bg-blue-50 px-6 py-3 font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submittingAction ===
            "scheduled"
              ? "Scheduling..."
              : "Schedule"}
          </button>

          {/* Publish */}

          <button
            type="button"
            disabled={
              submitting ||
              deleting
            }
            onClick={() =>
              submitForm("published")
            }
            className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submittingAction ===
            "published"
              ? "Publishing..."
              : "Publish Now"}
          </button>

        </div>
      </section>

      {/* ====================================== */}
      {/* MANAGEMENT */}
      {/* ====================================== */}

      {isEdit && (
        <section className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-2 text-xl font-bold">
            Article Management
          </h2>

          <p className="mb-6 text-sm text-gray-500">
            Archive or permanently delete
            this article.
          </p>

          <div className="flex flex-wrap gap-4">

            {/* Archive */}

            <button
              type="button"
              disabled={
                submitting ||
                deleting
              }
              onClick={() =>
                submitForm("archived")
              }
              className="rounded-lg border border-orange-300 px-6 py-3 font-semibold text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingAction ===
              "archived"
                ? "Archiving..."
                : "Archive"}
            </button>

            {/* Delete */}

            <button
              type="button"
              disabled={
                submitting ||
                deleting
              }
              onClick={deleteNews}
              className="rounded-lg border border-red-300 px-6 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete Article"}
            </button>

          </div>

        </section>
      )}

    </div>
  );
}

// ==================================================
// UTC → Nepal datetime-local
// ==================================================

function formatDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  // Nepal = UTC + 05:45

  const nepalTime = new Date(
    date.getTime() +
      5 * 60 * 60 * 1000 +
      45 * 60 * 1000
  );

  const year =
    nepalTime.getUTCFullYear();

  const month = String(
    nepalTime.getUTCMonth() + 1
  ).padStart(2, "0");

  const day = String(
    nepalTime.getUTCDate()
  ).padStart(2, "0");

  const hours = String(
    nepalTime.getUTCHours()
  ).padStart(2, "0");

  const minutes = String(
    nepalTime.getUTCMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
