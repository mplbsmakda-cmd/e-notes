"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { doc } from "firebase/firestore";
import {
  useFirebase,
  useDoc,
  updateDocumentNonBlocking,
  useMemoFirebase,
} from "@/firebase";
import type { Note, SharedNote } from "@/lib/types";
import { LogoWithName } from "@/components/logo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

function SharedNoteSkeleton() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4">
        <Skeleton className="h-8 w-48" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="mt-2 h-5 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function SharedNotePage() {
  const params = useParams();
  const { firestore } = useFirebase();
  const sharedNoteId = params.sharedNoteId as string;

  const [linkInvalid, setLinkInvalid] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // 1. Fetch the share link document
  const sharedNoteRef = useMemoFirebase(() => {
    if (!firestore || !sharedNoteId) return null;
    return doc(firestore, "sharedNotes", sharedNoteId);
  }, [firestore, sharedNoteId]);
  const { data: sharedNoteData, isLoading: isSharedNoteLoading, error: sharedNoteError } = useDoc<SharedNote>(sharedNoteRef);

  // 2. Conditionally fetch the actual note
  const noteRef = useMemoFirebase(() => {
    if (!firestore || !sharedNoteData) return null;
    return doc(firestore, "notes", sharedNoteData.noteId);
  }, [firestore, sharedNoteData]);
  const { data: noteData, isLoading: isNoteLoading } = useDoc<Note>(noteRef);


  React.useEffect(() => {
    // Still waiting for the link document itself to load
    if (isSharedNoteLoading) {
      return;
    }

    // Link document has finished loading
    if (sharedNoteData) {
      if (sharedNoteData.isUsed) {
        setLinkInvalid(true);
        setIsLoading(false);
      } else if (noteData && sharedNoteRef) {
        // Link is valid and we have the note data, so we can display it.
        // NOW, we invalidate the link for the next person.
        updateDocumentNonBlocking(sharedNoteRef, { isUsed: true });
        setIsLoading(false);
      }
    } else if (!isSharedNoteLoading && (sharedNoteError || !sharedNoteData)) {
      // If loading is done and there's an error or no data, the link is invalid.
      setLinkInvalid(true);
      setIsLoading(false);
    }
    // We also depend on isNoteLoading to make sure we don't flash content
  }, [sharedNoteData, noteData, isSharedNoteLoading, sharedNoteRef, sharedNoteError]);

  if (isLoading || isNoteLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4 sm:p-8">
        <SharedNoteSkeleton />
      </div>
    );
  }

  if (linkInvalid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4 text-center">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Tautan Tidak Valid</CardTitle>
                <CardDescription>
                    Tautan ini mungkin sudah digunakan atau tidak ada lagi.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Akses Ditolak</AlertTitle>
                    <AlertDescription>
                        Silakan minta pemilik catatan untuk membagikan tautan baru jika Anda merasa ini adalah sebuah kesalahan.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!noteData) {
    // This case handles the moment between sharedNoteData being available and noteData being loaded
    return (
       <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4 sm:p-8">
         <SharedNoteSkeleton />
       </div>
    );
  }

  // Render the note content
  const date = noteData.updatedAt.toDate().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <LogoWithName />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{noteData.title}</CardTitle>
            <CardDescription>Terakhir diperbarui pada {date}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: noteData.content }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
