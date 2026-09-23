import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";
import { connectDB } from "@/lib/db";
import News from "@/models/News";

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

export default async function AdminNewsPage() {
  await connectDB();

  const news = await News.find()
    .populate("categories")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <AdminShell title="News">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              News
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

        {/* News list */}
        {news.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No news found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              You have not created any news articles yet.
            </p>

            <Link
              href="/admin/news/new"
              className="mt-5 inline-flex rounded-lg bg-[#005b37] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Create Your First News
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Desktop table */}
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
                  {news.map((item) => (
                    <tr
                      key={item._id.toString()}
                      className="transition hover:bg-gray-50"
                    >
                      {/* News */}
                      <td className="max-w-md px-5 py-5">
                        <div className="flex items-start gap-4">
                          {item.coverImage ? (
                            <img
                              src={item.coverImage}
                              alt={
                                item.imageAlt ||
                                item.title ||
                                "News image"
                              }
                              className="h-16 w-24 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                              No image
                            </div>
                          )}

                          <div className="min-w-0">
                            <h2 className="line-clamp-2 font-semibold text-gray-900">
                              {item.title}
                            </h2>

                            {item.excerpt && (
                              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                {item.excerpt}
                              </p>
                            )}

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
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categories */}
                      <td className="px-5 py-5">
                        <div className="flex max-w-xs flex-wrap gap-2">
                          {item.categories?.length > 0 ? (
                            item.categories.map((category) => (
                              <span
                                key={category._id.toString()}
                                className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-[#005b37]"
                              >
                                {category.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">
                              No category
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>

                        {item.status === "scheduled" &&
                          item.scheduledAt && (
                            <p className="mt-2 text-xs text-gray-500">
                              {formatDate(item.scheduledAt)}
                            </p>
                          )}
                      </td>

                      {/* Views */}
                      <td className="px-5 py-5 text-sm text-gray-600">
                        {Number(item.views || 0).toLocaleString()}
                      </td>

                      {/* Created */}
                      <td className="px-5 py-5 text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-5 text-right">
                        <Link
                          href={`/admin/news/${item._id}/edit`}
                          className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[#005b37] hover:text-[#005b37]"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-gray-100 md:hidden">
              {news.map((item) => (
                <div
                  key={item._id.toString()}
                  className="p-4"
                >
                  <div className="flex gap-4">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={
                          item.imageAlt ||
                          item.title ||
                          "News image"
                        }
                        className="h-20 w-28 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                        No image
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 font-semibold text-gray-900">
                        {item.title}
                      </h2>

                      <div className="mt-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.categories?.length > 0 ? (
                      item.categories.map((category) => (
                        <span
                          key={category._id.toString()}
                          className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-[#005b37]"
                        >
                          {category.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        No category
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {Number(item.views || 0).toLocaleString()} views
                    </span>

                    <span>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="mt-4">
                    <Link
                      href={`/admin/news/${item._id}/edit`}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:border-[#005b37] hover:text-[#005b37]"
                    >
                      Edit News
                    </Link>
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