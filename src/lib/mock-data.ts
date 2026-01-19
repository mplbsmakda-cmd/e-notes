import type { Note } from "./types";

export const mockNotes: Note[] = [
  {
    id: "1",
    title: "Catatan Sejarah Kemerdekaan",
    content: "Proklamasi Kemerdekaan Indonesia dibacakan pada 17 Agustus 1945. Teks proklamasi disusun oleh Soekarno, Hatta, dan Achmad Soebardjo.",
    category: "Sejarah",
    tags: ["kemerdekaan", "indonesia"],
    createdAt: "2023-10-01T10:00:00Z",
    updatedAt: "2023-10-01T10:00:00Z",
  },
  {
    id: "2",
    title: "Rumus Matematika Dasar",
    content: "Luas persegi: sisi x sisi. Luas segitiga: 1/2 x alas x tinggi. Lingkaran: π x r^2.",
    category: "Matematika",
    tags: ["rumus", "geometri"],
    createdAt: "2023-10-02T11:30:00Z",
    updatedAt: "2023-10-02T11:30:00Z",
  },
  {
    id: "3",
    title: "Konsep Fotosintesis",
    content: "Fotosintesis adalah proses tumbuhan mengubah cahaya matahari menjadi energi. Klorofil memainkan peran penting dalam proses ini. 6CO2 + 6H2O + Cahaya → C6H12O6 + 6O2",
    category: "Biologi",
    tags: ["tumbuhan", "sains", "energi"],
    createdAt: "2023-10-03T09:15:00Z",
    updatedAt: "2023-10-04T14:00:00Z",
  },
  {
    id: "4",
    title: "Jadwal Ujian Tengah Semester",
    content: "Senin: Matematika, Selasa: Bahasa Indonesia, Rabu: Sejarah, Kamis: Biologi, Jumat: Fisika.",
    category: "Akademik",
    tags: ["ujian", "jadwal"],
    createdAt: "2023-10-05T16:00:00Z",
    updatedAt: "2023-10-05T16:00:00Z",
  },
    {
    id: "5",
    title: "Puisi 'Hujan Bulan Juni'",
    content: "karya Sapardi Djoko Damono. 'tak ada yang lebih tabah dari hujan bulan Juni dirahasiakannya rintik rindunya kepada pohon berbunga itu...'",
    category: "Sastra",
    tags: ["puisi", "sastra indonesia"],
    createdAt: "2023-10-06T14:20:00Z",
    updatedAt: "2023-10-06T14:20:00Z",
  },
  {
    id: "6",
    title: "Daftar Belanja Kebutuhan Lab",
    content: "1. Mikroskop baru\n2. Cawan petri\n3. Larutan HCL\n4. Tabung reaksi",
    category: "Biologi",
    tags: ["lab", "belanja"],
    createdAt: "2023-10-07T08:00:00Z",
    updatedAt: "2023-10-07T08:00:00Z",
  }
];

export const mockCategories = ["Sejarah", "Matematika", "Biologi", "Akademik", "Sastra"];
export const mockTags = ["kemerdekaan", "indonesia", "rumus", "geometri", "tumbuhan", "sains", "energi", "ujian", "jadwal", "puisi", "sastra indonesia", "lab", "belanja"];
