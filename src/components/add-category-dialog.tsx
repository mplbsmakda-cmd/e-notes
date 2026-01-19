"use client";

import * as React from "react";
import { collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirebase, addDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
}: AddCategoryDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleAddCategory = () => {
    if (!user || !firestore) return;
    if (!name) {
      toast({
        title: "Nama Kategori Diperlukan",
        description: "Silakan masukkan nama untuk kategori baru Anda.",
        variant: "destructive",
      });
      return;
    }

    const categoriesCollection = collection(
      firestore,
      "users",
      user.uid,
      "categories"
    );

    const newCategory = {
      userId: user.uid,
      name,
      description,
    };

    addDocumentNonBlocking(categoriesCollection, newCategory);

    toast({
      title: "Kategori Ditambahkan!",
      description: `Kategori "${name}" telah berhasil dibuat.`,
    });

    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Kategori Baru</DialogTitle>
          <DialogDescription>
            Buat kategori baru untuk mengorganisir catatan Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Fisika Kuantum"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="(Opsional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="submit" onClick={handleAddCategory}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
