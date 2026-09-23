
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

  // Image
  Image,
  ImageUpload,
  ImageInsert,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,

  // Upload adapter
  SimpleUploadAdapter,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

export default function RichTextEditor({
  value = "",
  onChange,
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      <CKEditor
        editor={ClassicEditor}
        data={value}
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

            // Image plugins
            Image,
            ImageUpload,
            ImageInsert,
            ImageToolbar,
            ImageCaption,
            ImageStyle,
            ImageResize,

            // Upload adapter
            SimpleUploadAdapter,
          ],

          toolbar: {
            items: [
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
              "|",

              // THIS IS THE IMAGE BUTTON
              "insertImage",
            ],

            shouldNotGroupWhenFull: true,
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

          simpleUpload: {
            uploadUrl: "/api/admin/upload",
          },

          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
              },
              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
              },
              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
              },
              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
              },
            ],
          },

          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: "https://",
          },

          placeholder:
            "Write your news article here...",
        }}
        onChange={(event, editor) => {
          const data = editor.getData();

          onChange(data);
        }}
      />
    </div>
  );
}