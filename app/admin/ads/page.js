
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";

import { AD_POSITIONS, AD_STATUSES, } from "@/lib/ad-constants";


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("ne-NP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kathmandu",
  }).format(new Date(date));
}


function getStatusClass(status) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";

    case "inactive":
      return "bg-yellow-100 text-yellow-700";

    case "archived":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}


function getPositionLabel(position) {
  const labels = {
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

  return labels[position] || position;
}


/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function AdminAdsPage() {
  /*
   * -------------------------------------------------------
   * STATE
   * -------------------------------------------------------
   */

  const [ads, setAds] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [positionFilter, setPositionFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [updatingId, setUpdatingId] =
    useState(null);


  /*
   * -------------------------------------------------------
   * FETCH ADS
   * -------------------------------------------------------
   */

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (positionFilter) {
        params.set(
          "position",
          positionFilter
        );
      }

      if (statusFilter) {
        params.set(
          "status",
          statusFilter
        );
      }

      const queryString =
        params.toString();

      const url = queryString
        ? `/api/admin/ads?${queryString}`
        : "/api/admin/ads";

      const response =
        await fetch(url, {
          method: "GET",
          cache: "no-store",
        });

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Failed to fetch advertisements."
        );
      }

      setAds(
        Array.isArray(data.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error(
        "FETCH_ADS_ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to fetch advertisements."
      );
    } finally {
      setLoading(false);
    }
  }, [
    search,
    positionFilter,
    statusFilter,
  ]);


  /*
   * -------------------------------------------------------
   * INITIAL LOAD
   * -------------------------------------------------------
   */

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);


  /*
   * -------------------------------------------------------
   * DELETE
   * -------------------------------------------------------
   */

  async function handleDelete(ad) {
    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete "${ad.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(ad._id);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/ads/${ad._id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Failed to delete advertisement."
        );
      }

      setAds((current) =>
        current.filter(
          (item) =>
            item._id !== ad._id
        )
      );

      setSuccess(
        "Advertisement deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE_AD_ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to delete advertisement."
      );
    } finally {
      setDeletingId(null);
    }
  }


  /*
   * -------------------------------------------------------
   * TOGGLE STATUS
   * -------------------------------------------------------
   *
   * This gives the admin a quick ON/OFF control.
   *
   * We use PUT because status is part of the ad resource.
   *
   * -------------------------------------------------------
   */

  async function handleToggleStatus(ad) {
    const nextStatus =
      ad.status === "active"
        ? "inactive"
        : "active";

    try {
      setUpdatingId(ad._id);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/ads/${ad._id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: ad.name,

              position:
                ad.position,

              image:
                ad.image,

              linkUrl:
                ad.linkUrl,

              target:
                ad.target,

              status:
                nextStatus,

              startAt:
                ad.startAt,

              endAt:
                ad.endAt,

              priority:
                ad.priority,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Failed to update advertisement."
        );
      }

      setAds((current) =>
        current.map((item) =>
          item._id === ad._id
            ? data.data
            : item
        )
      );

      setSuccess(
        nextStatus === "active"
          ? "Advertisement activated."
          : "Advertisement deactivated."
      );
    } catch (error) {
      console.error(
        "TOGGLE_AD_ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to update advertisement."
      );
    } finally {
      setUpdatingId(null);
    }
  }


  /*
   * -------------------------------------------------------
   * RESET FILTERS
   * -------------------------------------------------------
   */

  function resetFilters() {
    setSearch("");
    setPositionFilter("");
    setStatusFilter("");
  }


  /*
   * -------------------------------------------------------
   * SUMMARY
   * -------------------------------------------------------
   */

  const summary = useMemo(() => {
    return {
      total: ads.length,

      active: ads.filter(
        (ad) =>
          ad.status === "active"
      ).length,

      inactive: ads.filter(
        (ad) =>
          ad.status === "inactive"
      ).length,

      archived: ads.filter(
        (ad) =>
          ad.status === "archived"
      ).length,
    };
  }, [ads]);


  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <AdminShell title="Advertisements">

      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Advertisements
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage advertisements and control
              where they appear on the website.
            </p>
          </div>


          <Link
            href="/admin/ads/new"
            className="inline-flex items-center justify-center rounded-lg bg-[#005b37] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00482c]"
          >
            + Create Advertisement
          </Link>

        </div>


        {/* =================================================
            MESSAGES
        ================================================= */}

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


        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {summary.total}
            </p>
          </div>


          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {summary.active}
            </p>
          </div>


          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Inactive
            </p>

            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {summary.inactive}
            </p>
          </div>


          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Archived
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-500">
              {summary.archived}
            </p>
          </div>

        </div>


        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-4">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            {/* Search */}

            <div className="md:col-span-2">

              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search advertisement..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#005b37] focus:ring-1 focus:ring-[#005b37]"
              />

            </div>


            {/* Position */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Position
              </label>

              <select
                value={positionFilter}
                onChange={(event) =>
                  setPositionFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#005b37] focus:ring-1 focus:ring-[#005b37]"
              >

                <option value="">
                  All positions
                </option>

                {AD_POSITIONS.map(
                  (position) => (
                    <option
                      key={position}
                      value={position}
                    >
                      {getPositionLabel(
                        position
                      )}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* Status */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#005b37] focus:ring-1 focus:ring-[#005b37]"
              >

                <option value="">
                  All statuses
                </option>

                {AD_STATUSES.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status
                        .charAt(0)
                        .toUpperCase() +
                        status.slice(1)}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>


          {(search ||
            positionFilter ||
            statusFilter) && (
            <div className="mt-3">

              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-[#005b37] hover:underline"
              >
                Clear filters
              </button>

            </div>
          )}

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#005b37]" />

            <p className="mt-3 text-sm text-gray-500">
              Loading advertisements...
            </p>

          </div>
        )}


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          ads.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                📢
              </div>

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                No advertisements found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your first advertisement
                to start displaying ads on the
                website.
              </p>

              <Link
                href="/admin/ads/new"
                className="mt-5 inline-flex rounded-lg bg-[#005b37] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Create Advertisement
              </Link>

            </div>
          )}


        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        {!loading &&
          ads.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead className="border-b border-gray-200 bg-gray-50">

                    <tr>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Advertisement
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Position
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Schedule
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Priority
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Analytics
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-gray-100">

                    {ads.map((ad) => (

                      <tr
                        key={ad._id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* Advertisement */}

                        <td className="px-5 py-4">

                          <div className="flex min-w-[260px] items-center gap-3">

                            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">

                              {ad.image?.url ? (
                                <img
                                  src={ad.image.url}
                                  alt={
                                    ad.image.alt ||
                                    ad.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                  No image
                                </div>
                              )}

                            </div>


                            <div className="min-w-0">

                              <p className="truncate font-semibold text-gray-900">
                                {ad.name}
                              </p>

                              <p className="mt-1 max-w-[240px] truncate text-xs text-gray-500">
                                {ad.linkUrl}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Position */}

                        <td className="px-5 py-4">

                          <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {getPositionLabel(
                              ad.position
                            )}
                          </span>

                        </td>


                        {/* Status */}

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              ad._id
                            }
                            onClick={() =>
                              handleToggleStatus(
                                ad
                              )
                            }
                            className="inline-flex items-center gap-2"
                            title="Toggle advertisement status"
                          >

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                ad.status
                              )}`}
                            >
                              {ad.status}
                            </span>

                          </button>

                        </td>


                        {/* Schedule */}

                        <td className="px-5 py-4 text-xs text-gray-600">

                          <div>
                            <span className="font-medium">
                              Start:
                            </span>{" "}
                            {formatDate(
                              ad.startAt
                            )}
                          </div>

                          <div className="mt-1">
                            <span className="font-medium">
                              End:
                            </span>{" "}
                            {formatDate(
                              ad.endAt
                            )}
                          </div>

                        </td>


                        {/* Priority */}

                        <td className="px-5 py-4">

                          <span className="font-semibold text-gray-700">
                            {ad.priority}
                          </span>

                        </td>


                        {/* Analytics */}

                        <td className="px-5 py-4 text-xs text-gray-600">

                          <div>
                            Impressions:{" "}
                            <span className="font-semibold">
                              {Number(
                                ad.impressions || 0
                              ).toLocaleString(
                                "en-US"
                              )}
                            </span>
                          </div>

                          <div className="mt-1">
                            Clicks:{" "}
                            <span className="font-semibold">
                              {Number(
                                ad.clicks || 0
                              ).toLocaleString(
                                "en-US"
                              )}
                            </span>
                          </div>

                        </td>


                        {/* Actions */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <Link
                              href={`/admin/ads/${ad._id}/edit`}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                              Edit
                            </Link>


                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                ad._id
                              }
                              onClick={() =>
                                handleDelete(
                                  ad
                                )
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              ad._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>


              {/* =================================================
                  MOBILE CARDS
              ================================================= */}

              <div className="divide-y divide-gray-100 md:hidden">

                {ads.map((ad) => (

                  <div
                    key={ad._id}
                    className="p-4"
                  >

                    <div className="flex gap-3">

                      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">

                        {ad.image?.url ? (
                          <img
                            src={ad.image.url}
                            alt={
                              ad.image.alt ||
                              ad.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}

                      </div>


                      <div className="min-w-0 flex-1">

                        <h3 className="font-semibold text-gray-900">
                          {ad.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {getPositionLabel(
                            ad.position
                          )}
                        </p>

                        <div className="mt-2">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              ad.status
                            )}`}
                          >
                            {ad.status}
                          </span>

                        </div>

                      </div>

                    </div>


                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600">

                      <div>
                        <span className="font-semibold">
                          Priority:
                        </span>{" "}
                        {ad.priority}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Clicks:
                        </span>{" "}
                        {Number(
                          ad.clicks || 0
                        ).toLocaleString(
                          "en-US"
                        )}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Start:
                        </span>{" "}
                        {formatDate(
                          ad.startAt
                        )}
                      </div>

                      <div>
                        <span className="font-semibold">
                          End:
                        </span>{" "}
                        {formatDate(
                          ad.endAt
                        )}
                      </div>

                    </div>


                    <div className="mt-4 flex gap-2">

                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          ad._id
                        }
                        onClick={() =>
                          handleToggleStatus(
                            ad
                          )
                        }
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700"
                      >
                        {ad.status ===
                        "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>


                      <Link
                        href={`/admin/ads/${ad._id}/edit`}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700"
                      >
                        Edit
                      </Link>


                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          ad._id
                        }
                        onClick={() =>
                          handleDelete(
                            ad
                          )
                        }
                        className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>
          )}

      </div>

    </AdminShell>
  );
}
