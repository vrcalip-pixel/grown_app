import { GuideFlow } from "@/components/GuideFlow";
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
          <div className="brand">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 29V15" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M16 16C16 9 11 5 4 5c0 7 5 11 12 11z" fill="#8fb8a6" />
              <path d="M16 13c0-6 4-9 11-9 0 6-4 9-11 9z" fill="#f2a93b" />
            </svg>
            Grown
          </div>
          <div className="tag">Version {ticket.version} · Long Beach, CA</div>
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
