"use client";

import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";
import AdvertisementForm from "@/components/admin/AdvertisementForm";

export default function NewAdvertisementPage() {
  return (
    <AdminShell title="Create Advertisement">
      <div className="space-y-6">
        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2">
              <Link
                href="/admin/ads"
                className="text-sm font-medium text-[#005b37] hover:underline"
              >
                ← Back to Advertisements
              </Link>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Create Advertisement
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create a new advertisement and choose where it appears.
            </p>
          </div>
        </div>

        <AdvertisementForm mode="create" />
      </div>
    </AdminShell>
  );
}
