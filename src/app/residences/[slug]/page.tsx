import { notFound } from "next/navigation";
import { PreviewView } from "@/components/views";
import { loadPreviews } from "@/pack/load";
import { RESIDENCE_PREVIEWS } from "../order";

// Every preview page is built ahead of time, so a direct link or a refresh always works.
export const dynamicParams = false;
export function generateStaticParams() {
  return RESIDENCE_PREVIEWS.map((slug) => ({ slug }));
}

export default async function Preview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preview = loadPreviews("residences", RESIDENCE_PREVIEWS).find((p) => p.id === slug);
  if (!preview) notFound();
  return <PreviewView preview={preview} />;
}
