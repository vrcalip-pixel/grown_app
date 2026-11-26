import { notFound } from "next/navigation";
import { PreviewView } from "@/components/views";
import { PREVIEW_CATEGORIES } from "@/i18n/categories";
import { loadPreviews } from "@/pack/load";

// Every preview page is built ahead of time, so a direct link or a refresh always works.
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.entries(PREVIEW_CATEGORIES).flatMap(([category, cat]) => cat.order.map((slug) => ({ category, slug })));
}

export default async function Preview({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const cat = PREVIEW_CATEGORIES[category];
  const preview = cat && loadPreviews(category, cat.order).find((p) => p.id === slug);
  if (!preview) notFound();
  return <PreviewView category={category} preview={preview} />;
}
