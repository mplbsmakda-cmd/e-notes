"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query as firestoreQuery, where } from "firebase/firestore";
import type { Note } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Pin } from "lucide-react";

function NoteCard({ note }: { note: Note }) {
  const date = note.updatedAt.toDate().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const plainTextContent = note.content.replace(/<[^>]+>/g, "");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full"
    >
      <Link href={`/dashboard/notes/${note.id}`} className="block h-full">
        <Card className="relative flex h-full flex-col transition-colors duration-300 hover:border-primary hover:shadow-lg">
          {note.pinned && (
            <Pin className="absolute right-4 top-4 h-4 w-4 text-muted-foreground" />
          )}
          <CardHeader>
            <CardTitle className="font-headline pr-6">{note.title}</CardTitle>
            <CardDescription>{date}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {plainTextContent}
            </p>
          </CardContent>
          <CardFooter className="flex-wrap gap-2">
            {note.category && <Badge variant="outline">{note.category}</Badge>}
            {note.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

function NoteSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  const { firestore, user } = useFirebase();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");

  const notesCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "notes");
  }, [firestore, user]);

  const { data: notes, isLoading } = useCollection<Note>(notesCollectionRef);

  const filteredNotes = React.useMemo(() => {
    if (!notes) return [];
    const filtered = notes.filter((note) => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const matchesQuery =
        searchQuery === "" ||
        note.title.toLowerCase().includes(lowerCaseQuery) ||
        note.content.toLowerCase().includes(lowerCaseQuery) ||
        (note.tags &&
          note.tags.some((t) => t.toLowerCase().includes(lowerCaseQuery)));

      const matchesCategory =
        !category ||
        (note.category &&
          note.category.toLowerCase() === category.toLowerCase());

      const matchesTag =
        !tag ||
        (note.tags &&
          note.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()));
          
      return matchesQuery && matchesCategory && matchesTag;
    });

    // Sort notes: pinned first, then by update date
    return filtered.sort((a, b) => {
      const aPinned = a.pinned ? 1 : 0;
      const bPinned = b.pinned ? 1 : 0;
      if (aPinned !== bPinned) {
        return bPinned - aPinned;
      }
      return b.updatedAt.toMillis() - a.updatedAt.toMillis();
    });
  }, [notes, searchQuery, category, tag]);

  let title = "Semua Catatan";
  if (searchQuery) {
    title = `Hasil pencarian untuk "${searchQuery}"`;
  } else if (category) {
    title = `Catatan dalam kategori "${category}"`;
  } else if (tag) {
    title = `Catatan dengan tag "${tag}"`;
  }

  return (
    <div className="py-6">
      <h1 className="font-headline mb-6 text-2xl font-bold">{title}</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <NoteSkeleton key={i} />
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
          <h3 className="text-xl font-bold tracking-tight">
            Tidak ada catatan ditemukan
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || category || tag
              ? "Coba kata kunci atau filter yang berbeda."
              : "Buat catatan pertama Anda!"}
          </p>
        </div>
      )}
    </div>
  );
}
