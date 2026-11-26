import { ResidencesView } from "@/components/views";
import { loadPreviews } from "@/pack/load";
import { RESIDENCE_PREVIEWS } from "./order";

export default function Residences() {
  return <ResidencesView previews={loadPreviews("residences", RESIDENCE_PREVIEWS)} />;
}
