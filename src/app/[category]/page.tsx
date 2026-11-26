import { notFound } from "next/navigation";
import { CategoryView } from "@/components/views";
import { PREVIEW_CATEGORIES } from "@/i18n/categories";
import { loadPreviews } from "@/pack/load";

// One page per preview category (housing, medical, work and money), built ahead of time.
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(PREVIEW_CATEGORIES).map((category) => ({ category }));
}

export default async function Category({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = PREVIEW_CATEGORIES[category];
  if (!cat) notFound();
  return <CategoryView category={category} previews={loadPreviews(category, cat.order)} />;
}
