"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  CodeSquare,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import * as React from "react";

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const addImage = React.useCallback(() => {
    const url = window.prompt("Enter image URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="p-2 flex items-center gap-1 flex-wrap">
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        data-active={editor.isActive("heading", { level: 1 })}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Heading 1"
      >
        <Heading1 className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        data-active={editor.isActive("heading", { level: 2 })}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Heading 2"
      >
        <Heading2 className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        data-active={editor.isActive("heading", { level: 3 })}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Heading 3"
      >
        <Heading3 className="size-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        data-active={editor.isActive("bold")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Bold"
      >
        <Bold className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        data-active={editor.isActive("italic")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Italic"
      >
        <Italic className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        data-active={editor.isActive("strike")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Strikethrough"
      >
        <Strikethrough className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        data-active={editor.isActive("code")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Inline Code"
      >
        <Code className="size-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        data-active={editor.isActive("bulletList")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Bullet List"
      >
        <List className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        data-active={editor.isActive("orderedList")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Ordered List"
      >
        <ListOrdered className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        data-active={editor.isActive("blockquote")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Blockquote"
      >
        <Quote className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        data-active={editor.isActive("codeBlock")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Code Block"
      >
        <CodeSquare className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={addImage}
        aria-label="Add Image"
      >
        <ImageIcon className="size-4" />
      </Button>
    </div>
  );
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none px-4 py-2 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md",
      },
    },
  });

  React.useEffect(() => {
    if (editor) {
      const isSame = editor.getHTML() === value;
      if (isSame) {
        return;
      }
      // Use a timeout to avoid a collision between setting the content and
      // a potential focus event.
      setTimeout(() => {
        editor.commands.setContent(value, false);
      }, 0);
    }
  }, [value, editor]);

  return (
    <div className="rounded-lg border bg-card">
      <Toolbar editor={editor} />
      <Separator />
      <div className="min-h-[400px] overflow-auto">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
}
