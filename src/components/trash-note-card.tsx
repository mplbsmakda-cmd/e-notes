"use client";

import * as React from "react";
import { doc } from "firebase/firestore";
import { RotateCcw, Trash2 } from "lucide-react";
import {
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  useFirebase,
} from "@/firebase";
import type { Note } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import { motion } from "framer-motion";

interface TrashNoteCardProps {
  note: Note;
}

export function TrashNoteCard({ note }: TrashNoteCardProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const date = note.updatedAt.toDate().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleRestore = () => {
    if (!firestore) return;
    const noteRef = doc(firestore, "notes", note.id);
    updateDocumentNonBlocking(noteRef, { status: "active" });
    toast({
      title: "Catatan Dipulihkan",
      description: `"${note.title}" telah dikembalikan ke catatan aktif Anda.`,
    });
  };

  const handleDeletePermanently = () => {
    if (!firestore) return;
    const noteRef = doc(firestore, "notes", note.id);
    deleteDocumentNonBlocking(noteRef);
    toast({
      title: "Catatan Dihapus Permanen",
      variant: "destructive",
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div>
        <h3 className="font-semibold">{note.title}</h3>
        <p className="text-sm text-muted-foreground">Dibuang pada: {date}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleRestore}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Pulihkan
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Permanen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus catatan secara permanen?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat diurungkan. Catatan akan dihapus selamanya.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePermanently}
                className="bg-destructive hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}
