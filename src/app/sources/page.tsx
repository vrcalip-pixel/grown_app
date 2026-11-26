import { SourcesView } from "@/components/views";
import { checkedIso, loadPack } from "@/pack/load";

export default function Sources() {
  const pack = loadPack("traffic-ticket-long-beach");
  if (pack.status !== "live") throw new Error("The ticket guide must be live");
  const sources = Object.values(pack.sources).map((s) => ({ title: s.title, url: s.url, covers: s.covers.en }));
  return <SourcesView sources={sources} checkedIso={checkedIso(pack)} />;
}
