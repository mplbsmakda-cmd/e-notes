"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useToast } from "@/hooks/use-toast";

export default function NewNotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [tags, setTags] = React.useState("");

  const handleSave = () => {
    // In a real app, you would save the new note here.
    toast({
      title: "Catatan Disimpan!",
      description: "Catatan baru Anda telah berhasil dibuat.",
    });
    router.push("/dashboard");
  };

  return (
    <div className="py-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">Buat Catatan Baru</h1>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="title">Judul</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul catatan Anda..."
            className="text-lg"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="content">Isi Catatan</Label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Mulai menulis di sini..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Matematika"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., rumus, penting"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
             <Link href="/dashboard">Batal</Link>
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Simpan Catatan
          </Button>
        </div>
      </div>
    </div>
  );
}
