import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";

export const runtime = "nodejs";


/*
|--------------------------------------------------------------------------
| POST /api/admin/news/import
|--------------------------------------------------------------------------
|
| Supports:
|
| CSV
| JSON
|
*/

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();

    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const text = buffer.toString("utf-8");

    let records = [];


    /*
    |--------------------------------------------------------------------------
    | JSON
    |--------------------------------------------------------------------------
    */

    if (filename.endsWith(".json")) {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        records = parsed;
      } else if (Array.isArray(parsed.news)) {
        records = parsed.news;
      } else {
        throw new Error(
          "JSON must contain an array of news"
        );
      }
    }


    /*
    |--------------------------------------------------------------------------
    | CSV
    |--------------------------------------------------------------------------
    */

    else if (filename.endsWith(".csv")) {

      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

    }


    /*
    |--------------------------------------------------------------------------
    | INVALID FILE
    |--------------------------------------------------------------------------
    */

    else {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only CSV and JSON files are supported",
        },
        { status: 400 }
      );
    }


    if (!records.length) {
      return NextResponse.json(
        {
          success: false,
          message: "File contains no records",
        },
        { status: 400 }
      );
    }


    /*
    |--------------------------------------------------------------------------
    | LIMIT
    |--------------------------------------------------------------------------
    |
    | Prevent accidental huge imports.
    |
    */

    if (records.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Maximum 1000 news articles can be imported at once",
        },
        { status: 400 }
      );
    }


    const documents = [];
    const errors = [];


    /*
    |--------------------------------------------------------------------------
    | PROCESS RECORDS
    |--------------------------------------------------------------------------
    */

    for (let i = 0; i < records.length; i++) {

      const row = records[i];

      try {

        if (!row.title) {
          throw new Error(
            "Title is required"
          );
        }


        /*
        |--------------------------------------------------------------------------
        | CATEGORIES
        |--------------------------------------------------------------------------
        */

        let categoryIds = [];

        if (row.categories) {

          let categoryNames = row.categories;

          if (typeof categoryNames === "string") {
            categoryNames = categoryNames
              .split("|")
              .map((item) => item.trim())
              .filter(Boolean);
          }

          for (const categoryName of categoryNames) {

            const category = await Category.findOne({
              $or: [
                {
                  slug: categoryName,
                },
                {
                  name: categoryName,
                },
              ],
            });

            if (category) {
              categoryIds.push(category._id);
            }
          }
        }


        /*
        |--------------------------------------------------------------------------
        | SLUG
        |--------------------------------------------------------------------------
        */

        let slug = row.slug;

        if (!slug) {
          slug = row.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/--+/g, "-")
            .trim();
        }


        /*
        |--------------------------------------------------------------------------
        | DOCUMENT
        |--------------------------------------------------------------------------
        */

        documents.push({

          title: row.title.trim(),

          slug,

          excerpt:
            row.excerpt ||
            "",

          content:
            row.content ||
            "",

          categories:
            categoryIds,

          status:
            row.status ||
            "draft",

          featured:
            String(row.featured).toLowerCase() ===
            "true",

          breaking:
            String(row.breaking).toLowerCase() ===
            "true",

          readTime:
            Number(row.readTime) || 1,

          publishedAt:
            row.publishedAt
              ? new Date(row.publishedAt)
              : null,

        });

      } catch (error) {

        errors.push({
          row: i + 2,
          title: row.title || "",
          error: error.message,
        });

      }
    }


    /*
    |--------------------------------------------------------------------------
    | INSERT
    |--------------------------------------------------------------------------
    */

    let inserted = [];

    if (documents.length) {

      inserted =
        await News.insertMany(
          documents,
          {
            ordered: false,
          }
        );
    }


    return NextResponse.json({
      success: true,

      message:
        `${inserted.length} news articles imported successfully`,

      imported:
        inserted.length,

      failed:
        errors.length,

      errors,
    });

  } catch (error) {

    console.error(
      "IMPORT NEWS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to import news",
      },
      { status: 500 }
    );
  }
}