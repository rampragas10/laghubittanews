import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    // =========================================
    // PAGINATION
    // =========================================

    const requestedPage = Number.parseInt(
      searchParams.get("page") || "1",
      10
    );

    const page = Number.isNaN(requestedPage)
      ? 1
      : Math.max(requestedPage, 1);

    // Exactly 20 news per page
    const limit = 20;

    const skip = (page - 1) * limit;

    // =========================================
    // BUILD QUERY
    // =========================================

    const query = {};

    // =========================================
    // SEARCH
    // =========================================

    if (search) {
      const safeSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const regex = new RegExp(safeSearch, "i");

      query.$or = [
        { title: regex },
        { slug: regex },
        { excerpt: regex },
      ];
    }

    // =========================================
    // STATUS FILTER
    // =========================================

    if (status) {
      query.status = status;
    }

    // =========================================
    // CATEGORY FILTER
    // =========================================

    if (category) {
      const categoryDoc = await Category.findOne({
        slug: category,
      })
        .select("_id")
        .lean();

      // Category doesn't exist
      if (!categoryDoc) {
        return NextResponse.json({
          success: true,
          news: [],
          pagination: {
            page,
            limit,
            totalNews: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: page > 1,
          },
        });
      }

      // News stores category ObjectId
      query.categories = categoryDoc._id;
    }

    // =========================================
    // COUNT TOTAL MATCHING NEWS
    // =========================================

    const totalNews = await News.countDocuments(query);

    const totalPages = Math.ceil(totalNews / limit);

    // =========================================
    // REQUESTED PAGE DOES NOT EXIST
    // =========================================

    if (totalPages > 0 && page > totalPages) {
      return NextResponse.json({
        success: true,
        news: [],
        pagination: {
          page,
          limit,
          totalNews,
          totalPages,
          hasNextPage: false,
          hasPreviousPage: page > 1,
        },
      });
    }

    // =========================================
    // GET ONLY 20 NEWS
    // =========================================

    const news = await News.find(query)
      .populate({
        path: "categories",
        select: "name slug",
      })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .allowDiskUse(true)
      .lean();

    // =========================================
    // RESPONSE
    // =========================================

    return NextResponse.json({
      success: true,

      news,

      pagination: {
        page,
        limit,
        totalNews,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET ADMIN NEWS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to fetch news",
      },
      {
        status: 500,
      }
    );
  }
}