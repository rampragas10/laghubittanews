
import Link from "next/link";
import { notFound } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import AdvertisementForm from "@/components/admin/AdvertisementForm";

import { connectDB } from "@/lib/db";
import Ad from "@/models/Ad";

export const dynamic = "force-dynamic";

export default async function EditAdvertisementPage({
  params,
}) {
  const { id } = await params;

  await connectDB();

  const ad = await Ad.findById(id).lean();

  if (!ad) {
    notFound();
  }

  /*
   * Convert MongoDB values into plain serializable
   * JavaScript values before sending them to the
   * Client Component.
   */

  const initial = {
    _id: ad._id.toString(),

    name: ad.name,

    position: ad.position,

    image: ad.image
      ? {
          url: ad.image.url || "",
          publicId: ad.image.publicId || "",
          alt: ad.image.alt || "",
        }
      : {
          url: "",
          publicId: "",
          alt: "",
        },

    linkUrl: ad.linkUrl || "",

    target: ad.target || "_blank",

    status: ad.status || "inactive",

    priority: Number(ad.priority || 0),

    startAt: ad.startAt
      ? ad.startAt.toISOString()
      : null,

    endAt: ad.endAt
      ? ad.endAt.toISOString()
      : null,
  };

  return (
    <AdminShell title="Edit Advertisement">
      <div className="space-y-6">
        {/* Header */}

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
            Edit Advertisement
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update advertisement settings, image, destination,
            schedule, or status.
          </p>
        </div>

        <AdvertisementForm
          mode="edit"
          initial={initial}
        />
      </div>
    </AdminShell>
  );
}
