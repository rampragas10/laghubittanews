import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import News from "@/models/News";

const NEWS_PER_PAGE = 20;

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const requestedPage =
      Number(searchParams.get("page")) || 1;

    const page =
      Number.isInteger(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const skip =
      (page - 1) * NEWS_PER_PAGE;

    const filter = {
      status: "published",
    };

    const [news, total] =
      await Promise.all([
        News.find(filter)
          .select(
            "title slug excerpt coverImage imageAlt publishedAt categories"
          )
          .populate(
            "categories",
            "name slug"
          )
          .sort({
            publishedAt: -1,
            _id: -1,
          })
          .skip(skip)
          .limit(NEWS_PER_PAGE)
          .lean(),

        News.countDocuments(filter),
      ]);

    return NextResponse.json({
      success: true,

      data: news,

      pagination: {
        page,

        limit: NEWS_PER_PAGE,

        total,

        totalPages:
          Math.ceil(
            total / NEWS_PER_PAGE
          ),

        hasNextPage:
          page <
          Math.ceil(
            total / NEWS_PER_PAGE
          ),

        hasPreviousPage:
          page > 1,
      },
    });

  } catch (error) {
    console.error(
      "GET /api/news error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "समाचार प्राप्त गर्न सकिएन।",
      },
      {
        status: 500,
      }
    );
  }
}