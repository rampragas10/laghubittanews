
"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";

import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  BlockQuote,
  Table,
  TableToolbar,
  Image,
  ImageUpload,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  SimpleUploadAdapter,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

/*
|--------------------------------------------------------------------------
| Rich Text Editor
|--------------------------------------------------------------------------
|
| Features:
|
| - Heading
| - Bold
| - Italic
| - Underline
| - Links
| - Lists
| - Blockquote
| - Tables
| - Image upload
| - Image resize
| - Image caption
|
| Image upload:
|
| CKEditor
|    ↓
| POST /api/admin/upload
|    ↓
| /uploads/filename.jpg
|    ↓
| Image inserted into article content
|
|--------------------------------------------------------------------------
*/

export default function RichTextEditor({
  value = "",
  onChange,
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData();

          onChange(data);
        }}
        config={{
          licenseKey: "GPL",

          plugins: [
            Essentials,
            Paragraph,
            Heading,

            Bold,
            Italic,
            Underline,

            Link,

            List,

            BlockQuote,

            Table,
            TableToolbar,

            Image,
            ImageUpload,
            ImageToolbar,
            ImageCaption,
            ImageStyle,
            ImageResize,

            SimpleUploadAdapter,
          ],

          toolbar: [
            "undo",
            "redo",
            "|",

            "heading",
            "|",

            "bold",
            "italic",
            "underline",
            "|",

            "link",
            "|",

            "bulletedList",
            "numberedList",
            "|",

            "blockQuote",
            "insertTable",
            "|",

            "uploadImage",
          ],

          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
                class: "ck-heading_paragraph",
              },

              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
                class: "ck-heading_heading1",
              },

              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
                class: "ck-heading_heading2",
              },

              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
                class: "ck-heading_heading3",
              },
            ],
          },

          image: {
            toolbar: [
              "imageTextAlternative",
              "toggleImageCaption",
              "|",
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
              "|",
              "resizeImage",
            ],
          },

          table: {
            contentToolbar: [
              "tableColumn",
              "tableRow",
              "mergeTableCells",
            ],
          },

          simpleUpload: {
            uploadUrl: "/api/admin/upload",

            headers: {
              // Add authentication headers here later
              // when admin authentication is implemented.
            },
          },

          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: "https://",
          },

          placeholder:
            "Write your news article here...",
        }}
      />
    </div>
  );
}
