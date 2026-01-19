"use client";

import { Bold, Italic, Underline, List, ListOrdered, Heading2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-2 flex items-center gap-1 flex-wrap">
        <Button variant="ghost" size="icon" type="button"><Heading2 className="size-4" /></Button>
        <Button variant="ghost" size="icon" type="button"><Bold className="size-4" /></Button>
        <Button variant="ghost" size="icon" type="button"><Italic className="size-4" /></Button>
        <Button variant="ghost" size="icon" type="button"><Underline className="size-4" /></Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button variant="ghost" size="icon" type="button"><List className="size-4" /></Button>
        <Button variant="ghost" size="icon" type="button"><ListOrdered className="size-4" /></Button>
      </div>
      <Separator />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[400px] w-full resize-y border-0 rounded-t-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
