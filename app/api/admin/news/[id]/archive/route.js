import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/db";
import News from "@/models/News";

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    console.log("Toggle archive request:", id);

    const news = await News.findById(id);

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          message: "News article not found",
        },
        { status: 404 }
      );
    }

    if (news.status === "published") {
      news.status = "archived";
    } else if (news.status === "archived") {
      news.status = "published";
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only published or archived articles can be changed.",
        },
        { status: 400 }
      );
    }

    await news.save();

    revalidatePath("/admin/news");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message:
        news.status === "archived"
          ? "Article hidden successfully"
          : "Article shown successfully",
      data: {
        id: news._id.toString(),
        status: news.status,
      },
    });
  } catch (error) {
    console.error("Toggle archive error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update article visibility",
      },
      { status: 500 }
    );
  }
}