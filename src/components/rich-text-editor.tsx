"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Node } from '@tiptap/core';
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
  Link as LinkIcon,
  Highlighter,
  ListChecks,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import * as React from "react";

const Youtube = Node.create({
  name: 'youtube',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-youtube-video] iframe',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-youtube-video': '' }, ['iframe', {
      frameborder: '0',
      allowfullscreen: 'true',
      ...HTMLAttributes,
    }]];
  },

  addCommands() {
    return {
      setYoutubeVideo: (options: { src: string }) => ({ commands }) => {
        if (!options.src) {
          return false;
        }
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});


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

  const addYoutubeVideo = React.useCallback(() => {
    const url = window.prompt('Enter YouTube URL');

    if (url) {
      const extractYoutubeVideoId = (url: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };
      
      const videoId = extractYoutubeVideoId(url);

      if (videoId) {
        editor.chain().focus().setYoutubeVideo({ src: `https://www.youtube.com/embed/${videoId}` }).run();
      } else {
        window.alert('Please enter a valid YouTube URL.');
      }
    }
  }, [editor]);

  const setLink = React.useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
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
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        data-active={editor.isActive("highlight")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Highlight"
      >
        <Highlighter className="size-4" />
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
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        data-active={editor.isActive("taskList")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Task List"
      >
        <ListChecks className="size-4" />
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
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={addImage}
        aria-label="Add Image"
      >
        <ImageIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={addYoutubeVideo}
        aria-label="Add YouTube Video"
      >
        <Video className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={setLink}
        data-active={editor.isActive("link")}
        className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        aria-label="Add Link"
      >
        <LinkIcon className="size-4" />
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
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
        },
      }),
      Image,
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Youtube,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none px-4 py-2 [&_li[data-checked=true]>p]:line-through [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md",
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
