"use client";

import * as React from "react";
import Link from "next/link";
import { Folder, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export type CategoryWithChildren = Category & {
  children: CategoryWithChildren[];
};

interface CategoryListProps {
  categories: Category[];
}

interface CategoryItemProps {
  category: CategoryWithChildren;
}

function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const categoryMap: Map<string, CategoryWithChildren> = new Map();
  const rootCategories: CategoryWithChildren[] = [];

  if (!categories) return [];

  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  categories.forEach((category) => {
    const categoryNode = categoryMap.get(category.id);
    if (!categoryNode) return;

    if (category.parentId && categoryMap.has(category.parentId)) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(categoryNode);
      }
    } else {
      rootCategories.push(categoryNode);
    }
  });

  return rootCategories;
}

function CategoryItem({ category }: CategoryItemProps) {
  const hasChildren = category.children.length > 0;

  if (!hasChildren) {
    return (
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2"
      >
        <Link href={`/dashboard?category=${category.name}`}>
          <Folder className="h-4 w-4" />
          <span className="truncate">{category.name}</span>
        </Link>
      </Button>
    );
  }

  return (
    <Collapsible>
      <div className="flex w-full items-center">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="flex-1 justify-start gap-2"
        >
          <Link href={`/dashboard?category=${category.name}`}>
            <Folder className="h-4 w-4" />
            <span className="truncate">{category.name}</span>
          </Link>
        </Button>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="mt-1 flex flex-col gap-1 pl-4">
          <CategoryList categories={category.children} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CategoryList({ categories }: CategoryListProps) {
  const categoryTree = React.useMemo(
    () => buildCategoryTree(categories),
    [categories]
  );

  return (
    <>
      {categoryTree.map((category) => (
        <CategoryItem key={category.id} category={category} />
      ))}
    </>
  );
}
