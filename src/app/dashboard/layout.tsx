"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Folder,
  LogOut,
  PlusCircle,
  Search,
  Settings,
  User,
  Plus,
  Notebook,
  Trash2,
  Clock,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoWithName } from "@/components/logo";
import {
  useAuth,
  useUser,
  useCollection,
  useFirebase,
  useMemoFirebase,
} from "@/firebase";
import type { Category, Tag } from "@/lib/types";
import { collection } from "firebase/firestore";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { CategoryList } from "@/components/category-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PomodoroTimer } from "@/components/pomodoro-timer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();

  const [isAddCategoryOpen, setAddCategoryOpen] = useState(false);

  const categoriesCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "categories");
  }, [firestore, user]);

  const { data: categories, isLoading: areCategoriesLoading } =
    useCollection<Category>(categoriesCollectionRef);

  const tagsCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "tags");
  }, [firestore, user]);

  const { data: tags, isLoading: areTagsLoading } =
    useCollection<Tag>(tagsCollectionRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    auth.signOut();
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar className="print:hidden">
        <SidebarHeader>
          <div className="p-2">
            <LogoWithName />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/notes/new">
                  <PlusCircle />
                  Catatan Baru
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard">
                  <Notebook />
                  Semua Catatan
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/trash">
                  <Trash2 />
                  Sampah
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel className="flex w-full items-center justify-between">
              <span>Kategori</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setAddCategoryOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </SidebarGroupLabel>
            <div className="flex flex-col gap-1 px-2">
              {areCategoriesLoading ? (
                <p className="px-2 text-xs text-muted-foreground">Loading...</p>
              ) : (
                <CategoryList categories={categories || []} />
              )}
            </div>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Tags</SidebarGroupLabel>
            <div className="flex flex-wrap gap-2 px-2">
              {areTagsLoading ? (
                <span className="px-2 text-xs text-muted-foreground">
                  Loading tags...
                </span>
              ) : (
                tags?.slice(0, 10).map((tag) => (
                  <Button
                    key={tag.id}
                    variant="secondary"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs"
                    asChild
                  >
                    <Link href={`/dashboard?tag=${tag.name}`}>{tag.name}</Link>
                  </Button>
                ))
              )}
            </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 py-2 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 print:hidden">
          <SidebarTrigger className="md:hidden" />
          <div className="relative ml-auto flex-1 md:grow-0">
            <form action="/dashboard" method="GET">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                placeholder="Cari catatan..."
                className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[320px]"
              />
            </form>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Clock className="h-5 w-5" />
                <span className="sr-only">Buka Timer Pomodoro</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <PomodoroTimer />
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    width={40}
                    height={40}
                    alt="Avatar"
                    className="overflow-hidden rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.displayName || "Akun Saya"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0 print:p-0">
          {children}
        </main>
      </SidebarInset>
      <AddCategoryDialog
        open={isAddCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        categories={categories || []}
      />
    </SidebarProvider>
  );
}
