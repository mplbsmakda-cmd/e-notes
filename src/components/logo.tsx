import { BookMarked } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 bg-primary text-primary-foreground p-3 rounded-full size-16 shadow-md">
      <BookMarked className="h-8 w-8" />
    </div>
  );
}

export function LogoWithName() {
  return (
    <div className="flex items-center gap-2">
        <BookMarked className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl font-headline text-foreground">
          BukuCatatan
        </span>
    </div>
  )
}
