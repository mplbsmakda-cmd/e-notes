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
};
