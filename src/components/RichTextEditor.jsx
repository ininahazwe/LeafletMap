"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  return (
    <Editor
        // apiKey="xtdfqwkixkluz8wvqllhjvut3mnghn06cxj3yvopy7ellgfd"
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(_, editor) => (editorRef.current = editor)}
        value={value}
        onEditorChange={onChange}
        init={{
          height: 180,
          menubar: false,
          plugins: [
            "link",
            "advlist autolink lists charmap preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table help wordcount",
          ],
          toolbar:
            "undo redo | bold italic underline | link | bullist numlist | removeformat",
          link_default_target: "_blank",
          target_list: [{ title: "Nouvel onglet", value: "_blank" }],
          rel_list: [{ title: "noopener", value: "noopener" }],
          resize: false,
          branding: false,
          skin: "oxide", // ou 'oxide-dark' si tu veux un thème sombre
          content_css: "default", // ou 'dark' pour le thème sombre
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; padding:8px; }",
        }}
    />
  );
}
