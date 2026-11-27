import { notFound } from "next/navigation";
import { CategoryView } from "@/components/views";
import { PREVIEW_CATEGORIES } from "@/i18n/categories";
import { loadCategory } from "@/pack/load";

// One page per category that lists guides (housing, health, money), built ahead of time.
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(PREVIEW_CATEGORIES).map((category) => ({ category }));
}

export default async function Category({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = PREVIEW_CATEGORIES[category];
  if (!cat) notFound();
  // Only what the list needs is sent to the browser, not the whole guide.
  const guides = loadCategory(category, cat.order).map((p) => ({
    id: p.id,
    live: p.status === "live",
    title: p.card!.title,
    blurb: p.card!.blurb,
  }));
  return <CategoryView category={category} guides={guides} />;
}
