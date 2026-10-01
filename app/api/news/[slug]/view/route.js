import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import News from "@/models/News";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const { slug } = await params;

    console.log("VIEW TRACKING SLUG:", slug);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "News slug is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const news = await News.findOneAndUpdate(
      {
        slug,
        status: "published",
      },
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      }
    )
      .select("_id views slug")
      .lean();

    if (!news) {
      console.log("VIEW TRACKING: NEWS NOT FOUND");

      return NextResponse.json(
        {
          success: false,
          message: "Published news not found.",
        },
        { status: 404 }
      );
    }

    console.log("VIEW TRACKING SUCCESS:", {
      slug: news.slug,
      views: news.views,
    });

    return NextResponse.json(
      {
        success: true,
        views: news.views,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("NEWS_VIEW_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update news view.",
      },
      { status: 500 }
    );
  }
}