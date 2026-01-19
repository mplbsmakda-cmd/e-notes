"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { mockNotes } from "@/lib/mock-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditNotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [note, setNote] = React.useState<{ title: string; content: string; category: string; tags: string[] } | null>(null);

  React.useEffect(() => {
    const foundNote = mockNotes.find((n) => n.id === params.id);
    if (foundNote) {
      setNote(foundNote);
    } else {
      router.replace('/dashboard');
    }
  }, [params.id, router]);

  const handleUpdate = () => {
    // In a real app, you would update the note here.
    toast({
      title: "Catatan Diperbarui!",
      description: "Perubahan Anda telah berhasil disimpan.",
    });
    router.push("/dashboard");
  };

  const handleDelete = () => {
    toast({
      title: "Catatan Dihapus!",
      description: "Catatan telah dihapus secara permanen.",
      variant: "destructive"
    });
    router.push("/dashboard");
  }

  if (!note) {
    return (
       <div className="py-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-64 rounded-md" />
        </div>
        <div className="grid gap-6">
           <Skeleton className="h-10 w-full rounded-md" />
           <Skeleton className="h-96 w-full rounded-md" />
           <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
           </div>
           <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-headline">Edit Catatan</h1>
        </div>
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus catatan Anda secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="title">Judul</Label>
          <Input
            id="title"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            placeholder="Judul catatan Anda..."
            className="text-lg"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="content">Isi Catatan</Label>
          <RichTextEditor
            value={note.content}
            onChange={(value) => setNote({ ...note, content: value })}
            placeholder="Mulai menulis di sini..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              value={note.category}
              onChange={(e) => setNote({ ...note, category: e.target.value })}
              placeholder="e.g., Matematika"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
            <Input
              id="tags"
              value={note.tags.join(", ")}
              onChange={(e) => setNote({ ...note, tags: e.target.value.split(",").map(t => t.trim()) })}
              placeholder="e.g., rumus, penting"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
             <Link href="/dashboard">Batal</Link>
          </Button>
          <Button onClick={handleUpdate}>
            <Save className="mr-2 h-4 w-4" />
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
}
