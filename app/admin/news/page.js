"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AdminShell from "@/components/admin/AdminShell";
import NewsVisibilityButton from "@/components/admin/NewsVisibilityButton";

// =========================================================
// DATE FORMATTER
// =========================================================

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("ne-NP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kathmandu",
  }).format(new Date(date));
}

// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(status) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";

    case "scheduled":
      return "bg-blue-100 text-blue-700";

    case "archived":
      return "bg-gray-100 text-gray-700";

    case "draft":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

// =========================================================
// IMAGE URL
// =========================================================

function getImageUrl(image) {
  if (!image) return null;

  // Object format
  if (typeof image === "object") {
    image = image?.url;
  }

  if (!image || typeof image !== "string") {
    return null;
  }

  const value = image.trim();

  if (!value) return null;

  // Cloudinary / external image
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  // Local image
  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

// =========================================================
// IMAGE ALT
// =========================================================

function getImageAlt(item) {
  if (
    item.coverImage &&
    typeof item.coverImage === "object" &&
    item.coverImage.alt
  ) {
    return item.coverImage.alt;
  }

  if (item.imageAlt) {
    return item.imageAlt;
  }

  return item.title || "News image";
}

// =========================================================
// ADMIN NEWS PAGE
// =========================================================

export default function AdminNewsPage() {
  const [news, setNews] = useState([]);

  const [categories, setCategories] = useState([]);
const [category, setCategory] = useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  

  const [loading, setLoading] =
    useState(true);

  const [importing, setImporting] =
    useState(false);

    const [page, setPage] = useState(1);

const [pagination, setPagination] = useState({
  page: 1,
  limit: 20,
  totalNews: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});

  // =======================================================
  // LOAD CATEGORIES
  // =======================================================

const loadCategories = async () => {
  try {
    console.log("1️⃣ Loading categories...");

    const response = await fetch("/api/admin/categories", {
      method: "GET",
      cache: "no-store",
    });

    console.log("2️⃣ Response status:", response.status);

    const result = await response.json();

    console.log("3️⃣ Full response:", result);
    console.log("4️⃣ result.data:", result.data);
    console.log("5️⃣ Is result.data array:", Array.isArray(result.data));

    if (!response.ok) {
      throw new Error(
        result?.message || "Failed to load categories"
      );
    }

    if (!Array.isArray(result.data)) {
      console.error(
        "❌ result.data is NOT an array:",
        result.data
      );

      setCategories([]);
      return;
    }

    console.log(
      "6️⃣ Number of categories:",
      result.data.length
    );

    setCategories(result.data);

    console.log(
      "7️⃣ Categories state updated with:",
      result.data
    );
  } catch (error) {
    console.error("❌ CATEGORY ERROR:", error);
    setCategories([]);
  }
};

  // =======================================================
  // LOAD NEWS
  // =======================================================

const loadNews = async (requestedPage = page) => {
  try {
    setLoading(true);

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (status) {
      params.set("status", status);
    }

    if (category) {
      params.set("category", category);
    }

    params.set("page", requestedPage.toString());

    const url = `/api/admin/news?${params.toString()}`;

    console.log("NEWS API REQUEST:", url);

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    console.log("NEWS API RESPONSE:", data);

    if (!response.ok) {
      console.error("NEWS API ERROR:", data);

      throw new Error(
        data?.message || "Failed to load news"
      );
    }

    setNews(Array.isArray(data.news) ? data.news : []);

    setPagination(
      data.pagination || {
        page: requestedPage,
        limit: 20,
        totalNews: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: requestedPage > 1,
      }
    );

    setPage(requestedPage);
  } catch (error) {
    console.error("LOAD NEWS ERROR:", error);

    setNews([]);

    setPagination({
      page: 1,
      limit: 20,
      totalNews: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  } finally {
    setLoading(false);
  }
};

  // =======================================================
  // INITIAL LOAD
  // =======================================================

 useEffect(() => {
  loadCategories();
}, []);

  // =======================================================
  // SEARCH / FILTER
  // =======================================================

useEffect(() => {
  const timer = setTimeout(() => {
    loadNews(1);
  }, 400);

  return () => clearTimeout(timer);
}, [search, status, category]);

  // =======================================================
  // ARCHIVE
  // =======================================================

  async function archiveNews(id) {
    const confirmed =
      window.confirm(
        "Are you sure you want to archive this news?"
      );

    if (!confirmed) return;

    try {
      const response =
        await fetch(
          `/api/admin/news/${id}/archive`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to archive news"
        );

        return;
      }

      await loadNews();
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong"
      );
    }
  }

  // =======================================================
  // EXPORT JSON
  // =======================================================

  function exportJSON() {
    if (!news.length) {
      alert(
        "No news available to export"
      );

      return;
    }

    const exportData =
      news.map((item) => ({
        title: item.title || "",
        slug: item.slug || "",
        excerpt:
          item.excerpt || "",
        content:
          item.content || "",

        categories:
          item.categories?.map(
            (cat) => cat.slug
          ) || [],

        status:
          item.status || "draft",

        featured:
          Boolean(item.featured),

        breaking:
          Boolean(item.breaking),

        readTime:
          Number(
            item.readTime || 0
          ),

        publishedAt:
          item.publishedAt || null,

        scheduledAt:
          item.scheduledAt || null,

        coverImage:
          item.coverImage || null,

        images:
          item.images || [],

        imageAlt:
          item.imageAlt || "",
      }));

    const blob =
      new Blob(
        [
          JSON.stringify(
            exportData,
            null,
            2
          ),
        ],
        {
          type: "application/json",
        }
      );

    downloadFile(
      blob,
      `laghubitta-news-${Date.now()}.json`
    );
  }

  // =======================================================
  // CSV ESCAPE
  // =======================================================

  function escapeCSV(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return `"${String(value)
      .replaceAll('"', '""')}"`;
  }

  // =======================================================
  // EXPORT CSV
  // =======================================================

  function exportCSV() {
    if (!news.length) {
      alert(
        "No news available to export"
      );

      return;
    }

    const headers = [
      "title",
      "slug",
      "excerpt",
      "content",
      "categories",
      "status",
      "featured",
      "breaking",
      "readTime",
      "publishedAt",
      "scheduledAt",
      "imageAlt",
    ];

    const rows =
      news.map((item) => [
        item.title || "",
        item.slug || "",
        item.excerpt || "",
        item.content || "",

        item.categories
          ?.map(
            (category) =>
              category.slug
          )
          .join("|") || "",

        item.status || "draft",

        item.featured
          ? "true"
          : "false",

        item.breaking
          ? "true"
          : "false",

        item.readTime || "",

        item.publishedAt || "",

        item.scheduledAt || "",

        item.imageAlt || "",
      ]);

    const csv = [
      headers
        .map(escapeCSV)
        .join(","),

      ...rows.map((row) =>
        row
          .map(escapeCSV)
          .join(",")
      ),
    ].join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    downloadFile(
      blob,
      `laghubitta-news-${Date.now()}.csv`
    );
  }

  // =======================================================
  // DOWNLOAD FILE
  // =======================================================

  function downloadFile(
    blob,
    filename
  ) {
    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(
      anchor
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
  }

  // =======================================================
  // IMPORT FILE
  // =======================================================

  async function importFile(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const filename =
      file.name.toLowerCase();

    if (
      !filename.endsWith(".csv") &&
      !filename.endsWith(".json")
    ) {
      alert(
        "Please select a CSV or JSON file."
      );

      event.target.value = "";

      return;
    }

    const confirmed =
      window.confirm(
        `Import "${file.name}"?\n\nThis may create multiple news articles.`
      );

    if (!confirmed) {
      event.target.value = "";
      return;
    }

    try {
      setImporting(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/admin/news/import",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Import failed"
        );

        return;
      }

      let message =
        `${data.imported || 0} news imported successfully.`;

      if (data.failed) {
        message +=
          `\n${data.failed} rows failed.`;
      }

      alert(message);

      await loadNews();
    } catch (error) {
      console.error(
        "IMPORT ERROR:",
        error
      );

      alert(
        "Something went wrong while importing."
      );
    } finally {
      setImporting(false);

      event.target.value = "";
    }
  }

  // =======================================================
  // RESET FILTERS
  // =======================================================

  function resetFilters() {
    setSearch("");
    setStatus("");
    setCategory("");
  }



  const getPageNumbers = () => {
  const totalPages = pagination.totalPages;
  const currentPage = pagination.page;

  // No pagination
  if (totalPages <= 0) {
    return [];
  }

  // Show every page when there are only a few
  if (totalPages <= 5) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  // Near the beginning
  if (currentPage <= 3) {
    return [
      1,
      2,
      3,
      4,
      "...",
      totalPages,
    ];
  }

  // Near the end
  if (currentPage >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // Middle
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <AdminShell title="News">

      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              News Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage all your news articles.
            </p>
          </div>

          <Link
            href="/admin/news/new"
            className="inline-flex items-center justify-center rounded-lg bg-[#005b37] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00482c]"
          >
            + Create News
          </Link>

        </div>


        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-4">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* SEARCH */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search title, slug, excerpt..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#005b37] focus:ring-1 focus:ring-[#005b37]"
              />
            </div>


            {/* STATUS */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#005b37]"
              >
                <option value="">
                  All Status
                </option>

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


            {/* CATEGORY */}

            <div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Category
  </label>

 <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
>
  <option value="">All Categories</option>

  {categories.map((cat) => (
    <option key={cat._id} value={cat.slug}>
      {cat.name}
    </option>
  ))}
</select>

  {/* Temporary debugging */}
  <p className="mt-1 text-xs text-gray-400">
    Categories loaded: {categories.length}
  </p>
</div>

          </div>


          {/* FILTER ACTIONS */}

          {(search ||
            status ||
            category) && (
            <div className="mt-4">

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="text-sm font-medium text-[#005b37] hover:underline"
              >
                Clear filters
              </button>

            </div>
          )}

        </div>


        {/* =================================================
            IMPORT / EXPORT
        ================================================= */}

        <div className="flex flex-wrap gap-3">

          {/* IMPORT */}

          <label
            className={`inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#005b37] hover:text-[#005b37] ${
              importing
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >

            {importing
              ? "Importing..."
              : "Import CSV / JSON"}

            <input
              type="file"
              accept=".csv,.json,application/json,text/csv"
              onChange={
                importFile
              }
              disabled={
                importing
              }
              hidden
            />

          </label>


          {/* EXPORT JSON */}

          <button
            type="button"
            onClick={
              exportJSON
            }
            disabled={
              !news.length
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#005b37] hover:text-[#005b37] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export JSON
          </button>


          {/* EXPORT CSV */}

          <button
            type="button"
            onClick={
              exportCSV
            }
            disabled={
              !news.length
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#005b37] hover:text-[#005b37] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export CSV
          </button>

        </div>


        {/* =================================================
            RESULT COUNT
        ================================================= */}

        <div className="flex items-center justify-between">

          <p className="text-sm text-gray-500">

            {loading
              ? "Loading news..."
              : `${news.length} news found`}

          </p>

          {search && !loading && (
            <p className="text-sm text-gray-500">
              Search:
              {" "}
              <span className="font-medium text-gray-900">
                "{search}"
              </span>
            </p>
          )}

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">

            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-[#005b37]" />

            <p className="mt-3 text-sm text-gray-500">
              Loading news...
            </p>

          </div>
        )}


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          news.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">

              <h2 className="text-lg font-semibold text-gray-900">
                No news found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {search ||
                status ||
                category
                  ? "Try changing your search or filters."
                  : "You have not created any news articles yet."}
              </p>

              {(search ||
                status ||
                category) ? (
                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="mt-5 inline-flex rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/admin/news/new"
                  className="mt-5 inline-flex rounded-lg bg-[#005b37] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Create Your First News
                </Link>
              )}

            </div>
          )}


        {/* =================================================
            NEWS TABLE
        ================================================= */}

        {!loading &&
          news.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

              {/* =================================================
                  DESKTOP
              ================================================= */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead className="border-b border-gray-200 bg-gray-50">

                    <tr>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        News
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Category
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Views
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Created
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-gray-100">

                    {news.map(
                      (item) => {

                        const id =
                          item._id.toString();

                        const isArchived =
                          item.status ===
                          "archived";

                        const imageUrl =
                          getImageUrl(
                            item.coverImage
                          );

                        const imageAlt =
                          getImageAlt(
                            item
                          );

                        return (
                          <tr
                            key={id}
                            className={
                              isArchived
                                ? "bg-gray-50/70 transition hover:bg-gray-100"
                                : "transition hover:bg-gray-50"
                            }
                          >

                            {/* NEWS */}

                            <td className="max-w-md px-5 py-5">

                              <div className="flex items-start gap-4">

                                {imageUrl ? (
                                  <img
                                    src={
                                      imageUrl
                                    }
                                    alt={
                                      imageAlt
                                    }
                                    className={
                                      isArchived
                                        ? "h-16 w-24 shrink-0 rounded-lg object-cover opacity-50 grayscale"
                                        : "h-16 w-24 shrink-0 rounded-lg object-cover"
                                    }
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                    No image
                                  </div>
                                )}

                                <div className="min-w-0">

                                  <h2 className="line-clamp-2 font-semibold text-gray-900">
                                    {
                                      item.title
                                    }
                                  </h2>

                                  <div className="mt-2 flex flex-wrap gap-2">

                                    {item.featured && (
                                      <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                                        Featured
                                      </span>
                                    )}

                                    {item.breaking && (
                                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                        Breaking
                                      </span>
                                    )}

                                    {isArchived && (
                                      <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
                                        Hidden
                                      </span>
                                    )}

                                  </div>

                                </div>

                              </div>

                            </td>


                            {/* CATEGORY */}

                            <td className="px-5 py-5">

                              <div className="flex flex-wrap gap-2">

                                {item.categories?.length >
                                0 ? (
                                  item.categories.map(
                                    (
                                      cat
                                    ) => (
                                      <span
                                        key={cat._id.toString()}
                                        className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-[#005b37]"
                                      >
                                        {
                                          cat.name
                                        }
                                      </span>
                                    )
                                  )
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    No category
                                  </span>
                                )}

                              </div>

                            </td>


                            {/* STATUS */}

                            <td className="px-5 py-5">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                                  item.status
                                )}`}
                              >
                                {
                                  item.status
                                }
                              </span>

                              {item.status ===
                                "scheduled" &&
                                item.scheduledAt && (
                                  <p className="mt-2 text-xs text-gray-500">
                                    {formatDate(
                                      item.scheduledAt
                                    )}
                                  </p>
                                )}

                            </td>


                            {/* VIEWS */}

                            <td className="px-5 py-5 text-sm text-gray-600">

                              {Number(
                                item.views ||
                                  0
                              ).toLocaleString()}

                            </td>


                            {/* CREATED */}

                            <td className="px-5 py-5 text-sm text-gray-500">

                              {formatDate(
                                item.createdAt
                              )}

                            </td>


                            {/* ACTIONS */}

                            <td className="px-5 py-5">

                              <div className="flex items-center justify-end gap-2">

                                <Link
                                  href={`/admin/news/${id}/edit`}
                                  className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[#005b37] hover:text-[#005b37]"
                                >
                                  Edit
                                </Link>


                                {(item.status ===
                                  "published" ||
                                  item.status ===
                                    "archived") && (
                                  <NewsVisibilityButton
                                    newsId={id}
                                    status={
                                      item.status
                                    }
                                  />
                                )}

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>


              {/* =================================================
                  MOBILE
              ================================================= */}

              <div className="divide-y divide-gray-100 md:hidden">

                {news.map(
                  (item) => {

                    const id =
                      item._id.toString();

                    const isArchived =
                      item.status ===
                      "archived";

                    const imageUrl =
                      getImageUrl(
                        item.coverImage
                      );

                    const imageAlt =
                      getImageAlt(
                        item
                      );

                    return (
                      <div
                        key={id}
                        className={
                          isArchived
                            ? "bg-gray-50/70 p-4"
                            : "p-4"
                        }
                      >

                        <div className="flex gap-4">

                          {imageUrl ? (
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                imageAlt
                              }
                              className={
                                isArchived
                                  ? "h-20 w-28 shrink-0 rounded-lg object-cover opacity-50 grayscale"
                                  : "h-20 w-28 shrink-0 rounded-lg object-cover"
                              }
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                              No image
                            </div>
                          )}

                          <div className="min-w-0 flex-1">

                            <h2 className="line-clamp-2 font-semibold text-gray-900">
                              {
                                item.title
                              }
                            </h2>

                            <div className="mt-2 flex flex-wrap gap-2">

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                                  item.status
                                )}`}
                              >
                                {
                                  item.status
                                }
                              </span>

                              {isArchived && (
                                <span className="inline-flex rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                                  Hidden
                                </span>
                              )}

                            </div>

                          </div>

                        </div>


                        {/* CATEGORIES */}

                        <div className="mt-4 flex flex-wrap gap-2">

                          {item.categories?.length >
                          0 ? (
                            item.categories.map(
                              (
                                cat
                              ) => (
                                <span
                                  key={cat._id.toString()}
                                  className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-[#005b37]"
                                >
                                  {
                                    cat.name
                                  }
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-xs text-gray-400">
                              No category
                            </span>
                          )}

                        </div>


                        {/* META */}

                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">

                          <span>
                            {Number(
                              item.views ||
                                0
                            ).toLocaleString()}{" "}
                            views
                          </span>

                          <span>
                            {formatDate(
                              item.createdAt
                            )}
                          </span>

                        </div>


                        {/* ACTIONS */}

                        <div className="mt-4 flex gap-2">

                          <Link
                            href={`/admin/news/${id}/edit`}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:border-[#005b37] hover:text-[#005b37]"
                          >
                            Edit News
                          </Link>


                          {(item.status ===
                            "published" ||
                            item.status ===
                              "archived") && (
                            <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700">

                              <NewsVisibilityButton
                                newsId={id}
                                status={
                                  item.status
                                }
                              />

                            </div>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

      </div>

{pagination.totalPages > 0 && (
  <div className="mt-6 border-t border-gray-200 pt-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      {/* Result information */}
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold text-gray-900">
          {(pagination.page - 1) * pagination.limit + 1}
        </span>
        {" - "}
        <span className="font-semibold text-gray-900">
          {Math.min(
            pagination.page * pagination.limit,
            pagination.totalNews
          )}
        </span>
        {" of "}
        <span className="font-semibold text-gray-900">
          {pagination.totalNews}
        </span>{" "}
        news
      </div>

      {/* Pagination */}
      <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1">

        {/* Previous */}
        <button
          type="button"
          disabled={
            !pagination.hasPreviousPage || loading
          }
          onClick={() =>
            loadNews(pagination.page - 1)
          }
          className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex shrink-0 items-center gap-1">
          {getPageNumbers().map(
            (pageNumber, index) => {
              // Ellipsis
              if (pageNumber === "...") {
                return (
                  <span
                    key={`dots-${index}`}
                    className="px-2 text-sm text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={pageNumber}
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    loadNews(pageNumber)
                  }
                  className={`min-w-[38px] shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    pageNumber === pagination.page
                      ? "bg-[#005b37] text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          disabled={
            !pagination.hasNextPage || loading
          }
          onClick={() =>
            loadNews(pagination.page + 1)
          }
          className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>

      </div>
    </div>
  </div>
)}

    </AdminShell>
  );
}