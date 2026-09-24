
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-500">
        Loading editor...
      </div>
    ),
  }
);

export default function NewsForm({
  categories = [],
  initial = null,
}) {
  const router = useRouter();

  const isEdit = Boolean(initial?._id);

  /*
   * =========================================
   * BASIC FORM STATE
   * =========================================
   */

  const [title, setTitle] = useState(
    initial?.title || ""
  );

  const [excerpt, setExcerpt] = useState(
    initial?.excerpt || ""
  );

  const [content, setContent] = useState(
    initial?.content || ""
  );

  /*
   * =========================================
   * COVER IMAGE
   * =========================================
   *
   * Current schema:
   *
   * coverImage: {
   *   url: String,
   *   alt: String
   * }
   *
   * Also supports old records where
   * coverImage was just a string.
   */

  const [coverImage, setCoverImage] = useState(() => {
    if (!initial?.coverImage) {
      return {
        url: "",
        alt: "",
      };
    }

    if (
      typeof initial.coverImage === "object"
    ) {
      return {
        url:
          initial.coverImage.url || "",
        alt:
          initial.coverImage.alt || "",
      };
    }

    if (
      typeof initial.coverImage === "string"
    ) {
      return {
        url: initial.coverImage,
        alt: initial?.imageAlt || "",
      };
    }

    return {
      url: "",
      alt: "",
    };
  });

  const [imageAlt, setImageAlt] = useState(
    initial?.coverImage?.alt ||
      initial?.imageAlt ||
      ""
  );

  /*
   * =========================================
   * GALLERY IMAGES
   * =========================================
   */

  const [galleryImages, setGalleryImages] =
    useState(
      Array.isArray(initial?.images)
        ? initial.images
            .map((image) => ({
              url: image?.url || "",
              alt: image?.alt || "",
              caption:
                image?.caption || "",
            }))
            .filter(
              (image) => image.url
            )
        : []
    );

  /*
   * =========================================
   * CATEGORIES
   * =========================================
   */

  const [selectedCategories, setSelectedCategories] =
    useState(
      Array.isArray(initial?.categories)
        ? initial.categories.map((category) =>
            typeof category === "object"
              ? String(category._id)
              : String(category)
          )
        : []
    );

  /*
   * =========================================
   * TAGS
   * =========================================
   */

  const [tags, setTags] = useState(
    Array.isArray(initial?.tags)
      ? initial.tags.join(", ")
      : ""
  );

  /*
   * =========================================
   * STATUS
   * =========================================
   */

  const [status, setStatus] = useState(
    initial?.status || "draft"
  );

  /*
   * =========================================
   * FEATURED / BREAKING
   * =========================================
   */

  const [featured, setFeatured] =
    useState(Boolean(initial?.featured));

  const [breaking, setBreaking] =
    useState(Boolean(initial?.breaking));

  /*
   * =========================================
   * READ TIME
   * =========================================
   */

  const [readTime, setReadTime] = useState(
    initial?.readTime || 3
  );

  /*
   * =========================================
   * SCHEDULE
   * =========================================
   */

  const [scheduledAt, setScheduledAt] =
    useState(() => {
      if (!initial?.scheduledAt) {
        return "";
      }

      const date = new Date(
        initial.scheduledAt
      );

      if (
        Number.isNaN(date.getTime())
      ) {
        return "";
      }

      /*
       * datetime-local expects:
       * YYYY-MM-DDTHH:mm
       *
       * Convert browser local time.
       */

      const year = date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        date.getDate()
      ).padStart(2, "0");

      const hours = String(
        date.getHours()
      ).padStart(2, "0");

      const minutes = String(
        date.getMinutes()
      ).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    });

  /*
   * =========================================
   * UI STATE
   * =========================================
   */

  const [coverUploading, setCoverUploading] =
    useState(false);

  const [galleryUploading, setGalleryUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * =========================================
   * KEEP COVER ALT SYNCHRONIZED
   * =========================================
   */

  useEffect(() => {
    setCoverImage((current) => ({
      ...current,
      alt: imageAlt,
    }));
  }, [imageAlt]);

  /*
   * =========================================
   * COVER IMAGE UPLOAD
   * =========================================
   */

  async function handleCoverUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");
    setCoverUploading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/admin/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error?.message ||
            "Failed to upload cover image."
        );
      }

      const uploadedImage = {
        url:
          data?.data?.url || "",
        alt: "",
      };

      if (!uploadedImage.url) {
        throw new Error(
          "Upload succeeded but Cloudinary URL was not returned."
        );
      }

      setCoverImage(
        uploadedImage
      );

      setImageAlt("");

      setSuccess(
        "Cover image uploaded successfully."
      );
    } catch (uploadError) {
      console.error(
        "COVER_UPLOAD_ERROR:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Failed to upload cover image."
      );
    } finally {
      setCoverUploading(false);

      /*
       * Allow selecting the same file again.
       */

      event.target.value = "";
    }
  }

  /*
   * =========================================
   * REMOVE COVER IMAGE
   * =========================================
   */

  function removeCoverImage() {
    setCoverImage({
      url: "",
      alt: "",
    });

    setImageAlt("");
  }

  /*
   * =========================================
   * GALLERY UPLOAD
   * =========================================
   */

  async function handleGalleryUpload(
    event
  ) {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    setError("");
    setSuccess("");
    setGalleryUploading(true);

    try {
      const uploadedImages = [];

      for (const file of files) {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const response =
          await fetch(
            "/api/admin/upload",
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error?.message ||
              `Failed to upload ${file.name}.`
          );
        }

        const uploadedImage = {
          url:
            data?.data?.url || "",
          alt: "",
          caption: "",
        };

        if (!uploadedImage.url) {
          throw new Error(
            `Upload succeeded but Cloudinary URL was not returned for ${file.name}.`
          );
        }

        uploadedImages.push(
          uploadedImage
        );
      }

      setGalleryImages(
        (current) => [
          ...current,
          ...uploadedImages,
        ]
      );

      setSuccess(
        `${uploadedImages.length} gallery image${
          uploadedImages.length === 1
            ? ""
            : "s"
        } uploaded successfully.`
      );
    } catch (uploadError) {
      console.error(
        "GALLERY_UPLOAD_ERROR:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Failed to upload gallery images."
      );
    } finally {
      setGalleryUploading(false);

      event.target.value = "";
    }
  }

  /*
   * =========================================
   * REMOVE GALLERY IMAGE
   * =========================================
   */

  function removeGalleryImage(index) {
    setGalleryImages(
      (current) =>
        current.filter(
          (_, imageIndex) =>
            imageIndex !== index
        )
    );
  }

  /*
   * =========================================
   * UPDATE GALLERY ALT
   * =========================================
   */

  function updateGalleryAlt(
    index,
    value
  ) {
    setGalleryImages(
      (current) =>
        current.map(
          (image, imageIndex) =>
            imageIndex === index
              ? {
                  ...image,
                  alt: value,
                }
              : image
        )
    );
  }

  /*
   * =========================================
   * UPDATE GALLERY CAPTION
   * =========================================
   */

  function updateGalleryCaption(
    index,
    value
  ) {
    setGalleryImages(
      (current) =>
        current.map(
          (image, imageIndex) =>
            imageIndex === index
              ? {
                  ...image,
                  caption: value,
                }
              : image
        )
    );
  }

  /*
   * =========================================
   * CATEGORY TOGGLE
   * =========================================
   */

  function toggleCategory(
    categoryId
  ) {
    setSelectedCategories(
      (current) => {
        if (
          current.includes(
            categoryId
          )
        ) {
          return current.filter(
            (id) =>
              id !== categoryId
          );
        }

        return [
          ...current,
          categoryId,
        ];
      }
    );
  }

  /*
   * =========================================
   * SUBMIT FORM
   * =========================================
   */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    /*
     * Basic client validation.
     */

    if (!title.trim()) {
      setError(
        "Title is required."
      );
      return;
    }

    if (!content.trim()) {
      setError(
        "Content is required."
      );
      return;
    }

    if (
      !selectedCategories.length
    ) {
      setError(
        "Please select at least one category."
      );
      return;
    }

    if (
      status === "scheduled" &&
      !scheduledAt
    ) {
      setError(
        "Scheduled date and time are required."
      );
      return;
    }

    setSaving(true);

    try {
      const formData =
        new FormData();

      /*
       * =====================================
       * BASIC FIELDS
       * =====================================
       */

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

      /*
       * =====================================
       * COVER IMAGE
       * =====================================
       *
       * IMPORTANT:
       *
       * Backend expects:
       *
       * {
       *   url: "...",
       *   alt: "..."
       * }
       */

      formData.append(
        "coverImage",
        JSON.stringify({
          url:
            coverImage.url || "",
          alt:
            imageAlt.trim(),
        })
      );

      /*
       * =====================================
       * CATEGORIES
       * =====================================
       */

      selectedCategories.forEach(
        (categoryId) => {
          formData.append(
            "categories",
            categoryId
          );
        }
      );

      /*
       * =====================================
       * TAGS
       * =====================================
       */

      const parsedTags = tags
        .split(",")
        .map((tag) =>
          tag.trim()
        )
        .filter(Boolean);

      formData.append(
        "tags",
        JSON.stringify(
          parsedTags
        )
      );

      /*
       * =====================================
       * GALLERY
       * =====================================
       *
       * Only send URL/alt/caption.
       * No raw files are sent here.
       */

      formData.append(
        "images",
        JSON.stringify(
          galleryImages.map(
            (image) => ({
              url:
                image.url || "",
              alt:
                image.alt || "",
              caption:
                image.caption ||
                "",
            })
          )
        )
      );

      /*
       * =====================================
       * STATUS
       * =====================================
       */

      formData.append(
        "status",
        status
      );

      /*
       * =====================================
       * FEATURED
       * =====================================
       */

      formData.append(
        "featured",
        String(featured)
      );

      /*
       * =====================================
       * BREAKING
       * =====================================
       */

      formData.append(
        "breaking",
        String(breaking)
      );

      /*
       * =====================================
       * READ TIME
       * =====================================
       */

      formData.append(
        "readTime",
        String(readTime)
      );

      /*
       * =====================================
       * SCHEDULED AT
       * =====================================
       */

      formData.append(
        "scheduledAt",
        status === "scheduled"
          ? scheduledAt
          : ""
      );

      /*
       * =====================================
       * API URL
       * =====================================
       */

      const url = isEdit
        ? `/api/admin/news/${initial._id}`
        : "/api/admin/news";

      const method = isEdit
        ? "PUT"
        : "POST";

      /*
       * =====================================
       * REQUEST
       * =====================================
       */

      const response =
        await fetch(url, {
          method,
          body: formData,
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to save news."
        );
      }

      setSuccess(
        data?.message ||
          "News saved successfully."
      );

      /*
       * =====================================
       * REDIRECT
       * =====================================
       *
       * Give the user a short moment to
       * see the success message.
       */

      setTimeout(() => {
        router.push(
          "/admin/news"
        );

        router.refresh();
      }, 700);
    } catch (submitError) {
      console.error(
        "SAVE_NEWS_ERROR:",
        submitError
      );

      setError(
        submitError?.message ||
          "Failed to save news."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================================
   * DELETE NEWS
   * =========================================
   */

  async function handleDelete() {
    if (!isEdit) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this news article?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeleting(true);

    try {
      const response =
        await fetch(
          `/api/admin/news/${initial._id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to delete news."
        );
      }

      router.push(
        "/admin/news"
      );

      router.refresh();
    } catch (deleteError) {
      console.error(
        "DELETE_NEWS_ERROR:",
        deleteError
      );

      setError(
        deleteError?.message ||
          "Failed to delete news."
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* =====================================
          MESSAGES
          ===================================== */}

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

      {/* =====================================
          BASIC INFORMATION
          ===================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Basic Information
        </h2>

        <div className="space-y-5">
          {/* TITLE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
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
              required
            />
          </div>

          {/* EXCERPT */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(event) =>
                setExcerpt(
                  event.target.value
                )
              }
              rows={3}
              placeholder="Short description of the news..."
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          {/* CONTENT */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Content *
            </label>

            <RichTextEditor
              value={content}
              onChange={setContent}
            />
          </div>
        </div>
      </section>

      {/* =====================================
          COVER IMAGE
          ===================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Cover Image
        </h2>

        {coverImage.url ? (
          <div className="mb-5">
            <div className="overflow-hidden rounded-xl border bg-gray-100">
              <img
                src={coverImage.url}
                alt={
                  imageAlt ||
                  title ||
                  "Cover image"
                }
                className="h-72 w-full object-cover"
              />
            </div>

            <button
              type="button"
              onClick={
                removeCoverImage
              }
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Remove Cover Image
            </button>
          </div>
        ) : (
          <div className="mb-5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <p className="text-sm text-gray-500">
              No cover image selected.
            </p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Upload Cover Image
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={
              handleCoverUpload
            }
            disabled={
              coverUploading
            }
            className="block w-full rounded-lg border p-3 text-sm"
          />

          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG or WebP. Maximum
            size: 5MB.
          </p>
        </div>

        {/* ALT */}

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Image Alt Text
          </label>

          <input
            type="text"
            value={imageAlt}
            onChange={(event) => {
              const value =
                event.target.value;

              setImageAlt(value);

              setCoverImage(
                (current) => ({
                  ...current,
                  alt: value,
                })
              );
            }}
            placeholder="Describe the cover image"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
          />
        </div>

        {coverUploading && (
          <p className="mt-3 text-sm text-blue-600">
            Uploading cover image...
          </p>
        )}
      </section>

      {/* =====================================
          GALLERY
          ===================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Gallery Images
        </h2>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Upload Gallery Images
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={
              handleGalleryUpload
            }
            disabled={
              galleryUploading
            }
            className="block w-full rounded-lg border p-3 text-sm"
          />

          <p className="mt-2 text-xs text-gray-500">
            You can select multiple images.
            Each image must be smaller than
            5MB.
          </p>
        </div>

        {galleryUploading && (
          <p className="mt-4 text-sm text-blue-600">
            Uploading gallery images...
          </p>
        )}

        {galleryImages.length > 0 && (
          <div className="mt-6 space-y-6">
            {galleryImages.map(
              (image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className="rounded-xl border p-4"
                >
                  <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                    {/* IMAGE */}

                    <div>
                      <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={image.url}
                          alt={
                            image.alt ||
                            `Gallery image ${
                              index + 1
                            }`
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeGalleryImage(
                            index
                          )
                        }
                        className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    {/* DETAILS */}

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Alt Text
                        </label>

                        <input
                          type="text"
                          value={
                            image.alt
                          }
                          onChange={(
                            event
                          ) =>
                            updateGalleryAlt(
                              index,
                              event.target
                                .value
                            )
                          }
                          placeholder="Describe this image"
                          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Caption
                        </label>

                        <input
                          type="text"
                          value={
                            image.caption
                          }
                          onChange={(
                            event
                          ) =>
                            updateGalleryCaption(
                              index,
                              event.target
                                .value
                            )
                          }
                          placeholder="Image caption"
                          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* =====================================
          CATEGORIES
          ===================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Categories
        </h2>

        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">
            No active categories available.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {categories.map(
              (category) => {
                const categoryId =
                  String(
                    category._id
                  );

                const checked =
                  selectedCategories.includes(
                    categoryId
                  );

                return (
                  <label
                    key={
                      categoryId
                    }
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                      checked
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        checked
                      }
                      onChange={() =>
                        toggleCategory(
                          categoryId
                        )
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm font-medium text-gray-800">
                      {category.name}
                    </span>
                  </label>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* =====================================
          TAGS
          ===================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Tags
        </h2>

        <input
          type="text"
          value={tags}
          onChange={(event) =>
            setTags(
              event.target.value
            )
          }
          placeholder="microfinance, Nepal, banking"
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
        />

        <p className="mt-2 text-xs text-gray-500">
          Separate tags using commas.
        </p>
      </section>

      {/* =====================================
          PUBLISHING
          ===================================== */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Publishing
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* STATUS */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            >
              <option value="draft">
                Draft
              </option>

              <option value="scheduled">
                Scheduled
              </option>

              <option value="published">
                Published
              </option>

              <option value="archived">
                Archived
              </option>
            </select>
          </div>

          {/* READ TIME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                  ) || 3
                )
              }
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            />
          </div>
        </div>

        {/* SCHEDULE */}

        {status ===
          "scheduled" && (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Scheduled Date & Time
            </label>

            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) =>
                setScheduledAt(
                  event.target.value
                )
              }
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            />

            <p className="mt-2 text-xs text-gray-500">
              Enter the scheduled time in
              your local Kathmandu time.
            </p>
          </div>
        )}

        {/* FLAGS */}

        <div className="mt-6 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2">
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

            <span className="text-sm font-medium">
              Featured News
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
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

            <span className="text-sm font-medium">
              Breaking News
            </span>
          </label>
        </div>
      </section>

      {/* =====================================
          ACTIONS
          ===================================== */}

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={
                handleDelete
              }
              disabled={
                deleting ||
                saving
              }
              className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete News"}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/news"
              )
            }
            disabled={
              saving ||
              deleting
            }
            className="rounded-lg border px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              deleting ||
              coverUploading ||
              galleryUploading
            }
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : isEdit
              ? "Update News"
              : "Create News"}
          </button>
        </div>
      </section>
    </form>
  );
}
