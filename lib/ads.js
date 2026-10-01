import Ad from "@/models/Ad";
import { connectDB } from "@/lib/db";

/**
 * Get the currently active advertisement for a position.
 *
 * Rules:
 * - status must be active
 * - startAt must be empty or already started
 * - endAt must be empty or not expired
 * - highest priority wins
 */
export async function getAdByPosition(position) {
  try {
    await connectDB();

    const now = new Date();

    const ad = await Ad.findOne({
      position,
      status: "active",

      $and: [
        {
          $or: [
            { startAt: null },
            { startAt: { $lte: now } },
          ],
        },
        {
          $or: [
            { endAt: null },
            { endAt: { $gte: now } },
          ],
        },
      ],
    })
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .lean();

    return ad;
  } catch (error) {
    console.error(
      "GET_AD_BY_POSITION_ERROR:",
      error
    );

    return null;
  }
}
