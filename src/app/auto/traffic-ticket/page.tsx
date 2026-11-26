import { GuideFlow } from "@/components/GuideFlow";
import { GuideLanguageNote } from "@/components/views";
import { checkedOn, loadPack } from "@/pack/load";

export default function TrafficTicket() {
  const pack = loadPack("traffic-ticket-long-beach");
  if (pack.status !== "live") throw new Error("The ticket guide must be live");
  return (
    <>
      <GuideLanguageNote />
      <GuideFlow pack={pack} checkedOn={checkedOn(pack)} backHref="/auto" />
    </>
  );
}
