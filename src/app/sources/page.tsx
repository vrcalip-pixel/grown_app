import { SourcesView } from "@/components/views";
import { checkedIso, loadLivePacks } from "@/pack/load";

export default function Sources() {
  // One group per live guide. The ticket guide has no category of its own in its file; it is the Car guide.
  const groups = loadLivePacks()
    .map((pack) => ({
      id: pack.id,
      category: pack.category ?? "car",
      guide: pack.title.en,
      checkedIso: checkedIso(pack),
      sources: Object.values(pack.sources).map((s) => ({ title: s.title, url: s.url, covers: s.covers.en })),
    }))
    .sort((a, b) => (a.category === "car" ? -1 : b.category === "car" ? 1 : a.category.localeCompare(b.category)));
  return <SourcesView groups={groups} />;
}
