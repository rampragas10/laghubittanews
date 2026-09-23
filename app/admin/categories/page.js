"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/categories", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Failed to load categories."
        );
      }

      setCategories(data.data || []);
    } catch (error) {
      setError(error.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function addCategory(event) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Failed to create category."
        );
      }

      setName("");
      setDescription("");

      await loadCategories();
    } catch (error) {
      setError(error.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCategory(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `/api/admin/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Failed to delete category."
        );
      }

      await loadCategories();
    } catch (error) {
      setError(error.message || "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminShell title="Categories">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Category Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage news categories.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add Category */}
        <form
          onSubmit={addCategory}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Add Category
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category Name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                placeholder="e.g. लघुवित्त समाचार"
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none transition focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description
              </label>

              <input
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Category description"
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none transition focus:border-[#005b37] focus:ring-2 focus:ring-[#005b37]/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-lg bg-[#005b37] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00482b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add Category"}
          </button>
        </form>

        {/* Category List */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h3 className="font-semibold text-gray-900">
              All Categories
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {categories.length} categor
              {categories.length === 1 ? "y" : "ies"}
            </p>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              No categories found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900">
                      {category.name}
                    </h4>

                    <p className="mt-1 text-xs text-gray-500">
                      /{category.slug}
                    </p>

                    {category.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeCategory(category._id)
                    }
                    disabled={deletingId === category._id}
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === category._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}