import { SourcesView } from "@/components/views";
import { checkedIso, loadLivePacks } from "@/pack/load";

export default function Sources() {
  // The page is the full list for each category: every live guide in it, with that guide's sources.
  // The ticket guide has no category in its file; it is the Car guide.
  const guides = loadLivePacks().map((pack) => ({
    id: pack.id,
    category: pack.category ?? "car",
    guide: pack.title.en,
    checkedIso: checkedIso(pack),
    sources: Object.values(pack.sources).map((s) => ({ title: s.title, url: s.url, covers: s.covers.en })),
  }));
  const order = ["car", "housing", "health", "money"];
  const groups = [...new Set(guides.map((g) => g.category))]
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((category) => ({ category, guides: guides.filter((g) => g.category === category) }));
  return <SourcesView groups={groups} />;
}
