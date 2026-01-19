"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Pin, Sparkles } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { summarizeNote } from "@/ai/flows/summarize-note-flow";

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

  // State for AI Summary
  const [isSummaryLoading, setIsSummaryLoading] = React.useState(false);
  const [summary, setSummary] = React.useState("");
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = React.useState(false);

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
    updateDocumentNonBlocking(noteRef, { status: "trashed", pinned: false });
    toast({
      title: "Catatan dipindahkan ke Sampah",
      description: "Anda dapat memulihkannya dari folder Sampah.",
    });
    router.push("/dashboard");
  };

  const handleSummarize = async () => {
    const plainTextContent = content.replace(/<[^>]+>/g, "").trim();

    if (!plainTextContent) {
      toast({
        title: "Konten kosong",
        description: "Tidak ada yang bisa diringkas.",
        variant: "destructive",
      });
      return;
    }
    setIsSummaryLoading(true);
    setIsSummaryDialogOpen(true);
    setSummary(""); // Clear previous summary
    try {
      const result = await summarizeNote(plainTextContent);
      setSummary(result);
    } catch (error) {
      console.error("Error summarizing note:", error);
      toast({
        title: "Gagal Meringkas",
        description: "Terjadi kesalahan saat berkomunikasi dengan AI.",
        variant: "destructive",
      });
      setIsSummaryDialogOpen(false); // Close dialog on error
    } finally {
      setIsSummaryLoading(false);
    }
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
            variant="outline"
            size="icon"
            onClick={handleSummarize}
            aria-label="Ringkas Catatan"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
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
                <AlertDialogTitle>Pindahkan catatan ke Sampah?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan memindahkan catatan ke folder Sampah. Anda dapat memulihkannya nanti.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Pindahkan
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
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ringkasan Otomatis</DialogTitle>
            <DialogDescription>
              Berikut adalah ringkasan catatan Anda yang dibuat oleh AI.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isSummaryLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{summary}</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSummaryDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
