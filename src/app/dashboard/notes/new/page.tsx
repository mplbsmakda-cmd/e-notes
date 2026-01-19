"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { collection, serverTimestamp, doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import {
  useFirebase,
  addDocumentNonBlocking,
  useCollection,
  useMemoFirebase,
  setDocumentNonBlocking,
} from "@/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";

const MAX_DATE = new Date("9999-12-31T23:59:59Z");

export default function NewNotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [destruct, setDestruct] = React.useState("never");

  const categoriesCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "categories");
  }, [firestore, user]);
  const { data: categories } = useCollection<Category>(categoriesCollectionRef);

  const handleSave = () => {
    if (!user || !firestore) return;
    if (!title || !content) {
      toast({
        title: "Gagal Menyimpan",
        description: "Judul dan isi catatan tidak boleh kosong.",
        variant: "destructive",
      });
      return;
    }

    const notesCollection = collection(firestore, "notes");
    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    let destructTimestamp = MAX_DATE;
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

    const newNote: any = {
      ownerId: user.uid,
      permissions: { [user.uid]: "owner" },
      _canAccess: [user.uid],
      title,
      content,
      category,
      tags: tagsArray,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      destructAt: destructTimestamp,
    };

    addDocumentNonBlocking(notesCollection, newNote);

    // Save tags to tags collection (user-specific)
    if (tagsArray.length > 0) {
      const tagsCollectionRef = collection(
        firestore,
        "users",
        user.uid,
        "tags"
      );
      tagsArray.forEach((tagName) => {
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
      title: "Catatan Disimpan!",
      description: "Catatan baru Anda telah berhasil dibuat.",
    });
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-headline text-2xl font-bold">Buat Catatan Baru</h1>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., rumus, penting"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destruct">Hancurkan Otomatis</Label>
            <Select onValueChange={setDestruct} value={destruct}>
              <SelectTrigger id="destruct">
                <SelectValue placeholder="Pilih durasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Jangan pernah</SelectItem>
                <SelectItem value="1hour">Dalam 1 Jam</SelectItem>
                <SelectItem value="1day">Dalam 1 Hari</SelectItem>
                <SelectItem value="7days">Dalam 7 Hari</SelectItem>
              </SelectContent>
            </Select>
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
