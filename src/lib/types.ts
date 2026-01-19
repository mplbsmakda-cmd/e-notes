import type { Timestamp } from "firebase/firestore";

export type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  pinned?: boolean;
  status?: "active" | "trashed";
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  parentId?: string;
};

export type Tag = {
  id: string;
  userId: string;
  name: string;
};

export type SharedNote = {
  id: string;
  userId: string;
  noteId: string;
  isUsed: boolean;
  createdAt: Timestamp;
};
