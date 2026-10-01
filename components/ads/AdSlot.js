import Link from "next/link";

import { getAdByPosition } from "@/lib/ads";

export default async function AdSlot({
  position,
  className = "",
}) {
  const ad = await getAdByPosition(position);

  // No advertisement available
  if (!ad) {
    return null;
  }

  const imageUrl = ad.image?.url;

  // Advertisement must have an image
  if (!imageUrl) {
    return null;
  }

  const content = (
    <div
      className={`overflow-hidden rounded-lg ${className}`}
    >
      <img
        src={imageUrl}
        alt={
          ad.image?.alt ||
          ad.name ||
          "Advertisement"
        }
        className="block h-auto w-full object-cover"
      />
    </div>
  );

  // Advertisement without a destination URL
  if (!ad.linkUrl) {
    return content;
  }

  return (
    <Link
      href={ad.linkUrl}
      target={ad.target || "_blank"}
      rel={
        ad.target === "_blank"
          ? "noopener noreferrer sponsored"
          : "sponsored"
      }
      aria-label={ad.name}
    >
      {content}
    </Link>
  );
}
