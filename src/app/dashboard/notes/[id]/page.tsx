"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { doc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
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
import { useDoc, useFirebase, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import type { Note } from "@/lib/types";

export default function EditNotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  
  const noteRef = useMemoFirebase(() => {
    if (!user || !params.id) return null;
    return doc(firestore, "users", user.uid, "notes", params.id);
  }, [firestore, user, params.id]);

  const { data: noteData, isLoading } = useDoc<Note>(noteRef);

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    if (noteData) {
      setTitle(noteData.title);
      setContent(noteData.content);
      setCategory(noteData.category || "");
      setTags(noteData.tags || []);
    }
  }, [noteData]);
  
  const handleUpdate = () => {
    if (!noteRef) return;
    const updatedData = {
      title,
      content,
      category,
      tags,
      updatedAt: serverTimestamp(),
    };
    updateDocumentNonBlocking(noteRef, updatedData);
    toast({
      title: "Catatan Diperbarui!",
      description: "Perubahan Anda telah berhasil disimpan.",
    });
    router.push("/dashboard");
  };

  const handleDelete = () => {
    if (!noteRef) return;
    deleteDocumentNonBlocking(noteRef);
    toast({
      title: "Catatan Dihapus!",
      description: "Catatan telah dihapus secara permanen.",
      variant: "destructive"
    });
    router.push("/dashboard");
  }

  if (isLoading) {
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

  if (!noteData) {
     router.replace('/dashboard');
     return null;
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
              value={tags.join(", ")}
              onChange={(e) => setTags(e.target.value.split(",").map(t => t.trim()))}
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
