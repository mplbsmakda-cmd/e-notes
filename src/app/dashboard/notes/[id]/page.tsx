"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Pin } from "lucide-react";
import { doc, serverTimestamp, collection } from "firebase/firestore";

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
import {
  useDoc,
  useFirebase,
  useMemoFirebase,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  useCollection,
  setDocumentNonBlocking,
} from "@/firebase";
import type { Note, Category } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditNotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const noteRef = useMemoFirebase(() => {
    if (!user || !params.id) return null;
    return doc(firestore, "users", user.uid, "notes", params.id);
  }, [firestore, user, params.id]);

  const { data: noteData, isLoading } = useDoc<Note>(noteRef);

  const categoriesCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "categories");
  }, [firestore, user]);
  const { data: categories } = useCollection<Category>(categoriesCollectionRef);

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [pinned, setPinned] = React.useState(false);

  React.useEffect(() => {
    if (noteData) {
      setTitle(noteData.title);
      setContent(noteData.content);
      setCategory(noteData.category || "");
      setTags(noteData.tags || []);
      setPinned(noteData.pinned || false);
    }
  }, [noteData]);

  const handleTogglePin = () => {
    if (!noteRef) return;
    const newPinnedStatus = !pinned;
    setPinned(newPinnedStatus);
    updateDocumentNonBlocking(noteRef, { pinned: newPinnedStatus });
    toast({
      title: newPinnedStatus
        ? "Catatan telah dipin."
        : "Pin pada catatan telah dilepas.",
    });
  };

  const handleUpdate = () => {
    if (!noteRef || !user || !firestore) return;
    const updatedData = {
      title,
      content,
      category,
      tags,
      pinned,
      updatedAt: serverTimestamp(),
    };
    updateDocumentNonBlocking(noteRef, updatedData);

    // Save tags to tags collection
    if (tags.length > 0) {
      const tagsCollectionRef = collection(
        firestore,
        "users",
        user.uid,
        "tags"
      );
      tags.forEach((tagName) => {
        const tagId = tagName.toLowerCase();
        const tagDocRef = doc(tagsCollectionRef, tagId);
        setDocumentNonBlocking(
          tagDocRef,
          { name: tagName, userId: user.uid },
          { merge: true }
        );
      });
    }

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
      variant: "destructive",
    });
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-6">
        <div className="mb-6 flex items-center gap-4">
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
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold">Edit Catatan</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={pinned ? "secondary" : "outline"}
            size="icon"
            onClick={handleTogglePin}
            aria-label={pinned ? "Lepas pin" : "Sematkan catatan"}
          >
            <Pin className="h-4 w-4" />
          </Button>
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
                  Tindakan ini tidak dapat dibatalkan. Ini akan menghapus
                  catatan Anda secara permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="category">Kategori</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
            <Input
              id="tags"
              value={tags.join(", ")}
              onChange={(e) =>
                setTags(e.target.value.split(",").map((t) => t.trim()))
              }
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
