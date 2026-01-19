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
import type { Category } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: Category[];
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  categories,
}: AddCategoryDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [parentId, setParentId] = React.useState<string>("root");

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

    const newCategory: any = {
      userId: user.uid,
      name,
      description,
    };

    if (parentId !== "root") {
      newCategory.parentId = parentId;
    }

    addDocumentNonBlocking(categoriesCollection, newCategory);

    toast({
      title: "Kategori Ditambahkan!",
      description: `Kategori "${name}" telah berhasil dibuat.`,
    });

    setName("");
    setDescription("");
    setParentId("root");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Kategori Baru</DialogTitle>
          <DialogDescription>
            Buat kategori baru untuk mengorganisir catatan Anda. Anda juga dapat
            menempatkannya di bawah kategori yang ada.
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="parent-category" className="text-right">
              Induk
            </Label>
            <Select onValueChange={setParentId} defaultValue="root">
              <SelectTrigger id="parent-category" className="col-span-3">
                <SelectValue placeholder="Pilih kategori induk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Tidak ada (Root)</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
