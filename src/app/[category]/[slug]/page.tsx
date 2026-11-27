import { notFound } from "next/navigation";
import { GuideFlow } from "@/components/GuideFlow";
import { GuideLanguageNote, PreviewView } from "@/components/views";
import { PREVIEW_CATEGORIES } from "@/i18n/categories";
import { checkedOn, loadCategory } from "@/pack/load";

// Every guide page is built ahead of time, so a direct link or a refresh always works.
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.entries(PREVIEW_CATEGORIES).flatMap(([category, cat]) => cat.order.map((slug) => ({ category, slug })));
}

export default async function Guide({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const cat = PREVIEW_CATEGORIES[category];
  const pack = cat && loadCategory(category, cat.order).find((p) => p.id === slug);
  if (!pack) notFound();
  if (pack.status === "live") {
    return (
      <>
        <GuideLanguageNote />
        <GuideFlow pack={pack} checkedOn={checkedOn(pack)} backHref={`/${category}`} />
      </>
    );
  }
  return <PreviewView category={category} preview={pack} />;
}
