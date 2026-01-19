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
import { mockNotes } from "@/lib/mock-data";
import type { Note } from "@/lib/types";

function NoteCard({ note }: { note: Note }) {
  const date = new Date(note.updatedAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        <Card className="flex flex-col h-full hover:border-primary transition-colors duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">{note.title}</CardTitle>
            <CardDescription>{date}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {note.content}
            </p>
          </CardContent>
          <CardFooter className="flex-wrap gap-2">
            <Badge variant="outline">{note.category}</Badge>
            {note.tags.map((tag) => (
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

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");

  const filteredNotes = React.useMemo(() => {
    return mockNotes.filter((note) => {
      const matchesQuery =
        query === "" ||
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        !category || note.category.toLowerCase() === category.toLowerCase();
      const matchesTag = !tag || note.tags.includes(tag.toLowerCase());
      return matchesQuery && matchesCategory && matchesTag;
    });
  }, [query, category, tag]);

  let title = "Semua Catatan";
  if (query) {
    title = `Hasil pencarian untuk "${query}"`;
  } else if (category) {
    title = `Catatan dalam kategori "${category}"`;
  } else if (tag) {
    title = `Catatan dengan tag "${tag}"`;
  }


  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold font-headline mb-6">{title}</h1>
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-[400px]">
          <h3 className="text-xl font-bold tracking-tight">
            Tidak ada catatan ditemukan
          </h3>
          <p className="text-sm text-muted-foreground">
            Coba kata kunci atau filter yang berbeda.
          </p>
        </div>
      )}
    </div>
  );
}
