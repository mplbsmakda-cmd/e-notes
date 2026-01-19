"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Pin,
  Sparkles,
  Printer,
  FileDown,
  Share2,
} from "lucide-react";
import { doc, serverTimestamp, collection, setDoc } from "firebase/firestore";
import TurndownService from "turndown";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [destruct, setDestruct] = React.useState("never");

  // State for AI Summary
  const [isSummaryLoading, setIsSummaryLoading] = React.useState(false);
  const [summary, setSummary] = React.useState("");
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = React.useState(false);

  // State for Share Link
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState("");


  React.useEffect(() => {
    if (noteData) {
      setTitle(noteData.title);
      setContent(noteData.content);
      setCategory(noteData.category || "");
      setTags(noteData.tags || []);
      setPinned(noteData.pinned || false);
    }
  }, [noteData]);

  const handlePrint = () => {
    window.print();
  };

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

    let destructTimestamp: Date | null = null;
    if (destruct !== "never") {
      const destructDate = new Date();
      if (destruct === "1hour") {
        destructDate.setHours(destructDate.getHours() + 1);
      } else if (destruct === "1day") {
        destructDate.setDate(destructDate.getDate() + 1);
      } else if (destruct === "7days") {
        destructDate.setDate(destructDate.getDate() + 7);
      }
      destructTimestamp = destructDate;
    }


    const updatedData: any = {
      title,
      content,
      category,
      tags,
      pinned,
      updatedAt: serverTimestamp(),
      destructAt: destructTimestamp
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

  const handleExportMarkdown = () => {
    if (!content) return;

    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(content);

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.href = url;
    link.download = `${safeTitle || "catatan"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Catatan Diekspor",
      description: "Catatan Anda telah diekspor sebagai file Markdown.",
    });
  };

  const handleShare = async () => {
    if (!user || !firestore || !params.id) return;

    toast({ title: "Membuat tautan berbagi..." });

    const sharedNotesCollection = collection(firestore, "sharedNotes");
    const sharedNoteRef = doc(sharedNotesCollection); // Firestore auto-generates an ID here

    const newSharedNote = {
      userId: user.uid,
      noteId: params.id,
      isUsed: false,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(sharedNoteRef, newSharedNote);
      
      const url = `${window.location.origin}/share/${sharedNoteRef.id}`;
      setShareUrl(url);
      setIsShareDialogOpen(true);
    } catch (error) {
      console.error("Error creating share link:", error);
      toast({
        title: "Gagal membuat tautan",
        description: "Terjadi kesalahan saat membuat tautan berbagi.",
        variant: "destructive",
      });
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
    <div className="mx-auto max-w-4xl py-6 print:py-0">
      <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
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
            variant="outline"
            size="icon"
            onClick={handlePrint}
            aria-label="Cetak Catatan"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExportMarkdown}
            aria-label="Ekspor ke Markdown"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            aria-label="Bagikan Catatan"
          >
            <Share2 className="h-4 w-4" />
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

      {noteData?.destructAt && (
        <div className="mb-4">
          <Alert variant="destructive">
            <AlertTitle>Catatan ini akan hancur otomatis</AlertTitle>
            <AlertDescription>
              Catatan ini akan menjadi tidak dapat diakses pada{" "}
              {noteData.destructAt.toDate().toLocaleString("id-ID")}.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="title" className="print:hidden">
            Judul
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul catatan Anda..."
            className="text-lg print:border-none print:px-0 print:text-3xl print:font-bold"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="content" className="print:hidden">
            Isi Catatan
          </Label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Mulai menulis di sini..."
          />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 print:hidden">
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
          <div className="grid gap-2">
            <Label htmlFor="destruct">Hancurkan Otomatis</Label>
            <Select onValueChange={setDestruct} defaultValue="never">
              <SelectTrigger id="destruct">
                <SelectValue placeholder="Pilih durasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Jangan pernah / Hapus timer</SelectItem>
                <SelectItem value="1hour">Dalam 1 Jam</SelectItem>
                <SelectItem value="1day">Dalam 1 Hari</SelectItem>
                <SelectItem value="7days">Dalam 7 Hari</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 print:hidden">
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
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bagikan Catatan (Tautan Sekali Pakai)</DialogTitle>
            <DialogDescription>
              Tautan ini hanya dapat digunakan satu kali. Setelah dibuka, tautan
              akan hangus. Salin dan bagikan kepada orang yang Anda tuju.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 pt-4">
            <Input id="share-url" value={shareUrl} readOnly />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast({
                  title: "Tautan disalin!",
                  description: "Tautan berbagi telah disalin ke clipboard Anda.",
                });
              }}
            >
              Salin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
