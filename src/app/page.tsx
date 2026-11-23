import { GuideFlow } from "@/components/GuideFlow";
import { GrownLogo } from "@/components/GrownLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loadPack } from "@/pack/load";

export default function Home() {
  const ticket = loadPack("traffic-ticket-long-beach");
  const lease = loadPack("lease-long-beach");
  if (ticket.status !== "live" || lease.status !== "preview") throw new Error("Unexpected guide status");

  // The "last checked" date shown to people is the oldest check among the facts,
  // so the page never claims to be fresher than its stalest rule.
  const oldest = ticket.facts.map((f) => f.verified_on).sort()[0];
  const checkedOn = new Date(`${oldest}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <>
      <header>
        <div className="hwrap">
          <GrownLogo />
          <div className="hright">
            <div className="tag">Version {ticket.version} · Long Beach, CA</div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <GuideFlow pack={ticket} lease={lease} checkedOn={checkedOn} />

      <footer>
        <p>
          Grown explains what a document means and what your options are. It is not a lawyer and doesn&apos;t give
          legal advice. Grown never makes up fees or dates. It points you to the amount and due date printed on your
          own ticket or court notice. Facts last checked against official California court sources on {checkedOn}.
        </p>
        <p>
          Built by Dr. Vincent Calip for HDA 294/494, The Agentic Self (ASU). Version one: nothing you tap is saved. If you choose to use Ask Grown, your question and the answers you tapped
          are sent to Claude, an AI made by Anthropic, to write a reply. Grown does not store them.
        </p>
      </footer>
    </>
  );
}
