"use client";

import * as React from "react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query as firestoreQuery, where } from "firebase/firestore";
import type { Note } from "@/lib/types";
import { TrashNoteCard } from "@/components/trash-note-card";
import { Skeleton } from "@/components/ui/skeleton";

function NoteSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
  );
}


export default function TrashPage() {
  const { firestore, user } = useFirebase();
  const [queryTime] = React.useState(new Date());

  const notesQuery = useMemoFirebase(() => {
    if (!user) return null;
    const notesCollectionRef = collection(firestore, "notes");
    return firestoreQuery(
      notesCollectionRef,
      where("_canAccess", "array-contains", user.uid),
      where("status", "==", "trashed"),
      where("destructAt", ">", queryTime)
    );
  }, [firestore, user, queryTime]);

  const { data: notes, isLoading } = useCollection<Note>(notesQuery);

  return (
    <div className="py-6">
      <h1 className="font-headline mb-6 text-2xl font-bold">Sampah</h1>
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <NoteSkeleton key={i} />
          ))}
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="flex flex-col gap-4">
          {notes.map((note) => (
            <TrashNoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
          <h3 className="text-xl font-bold tracking-tight">
            Folder Sampah kosong
          </h3>
          <p className="text-sm text-muted-foreground">
            Catatan yang Anda buang akan muncul di sini.
          </p>
        </div>
      )}
    </div>
  );
}
