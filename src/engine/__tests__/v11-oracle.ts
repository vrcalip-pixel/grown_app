/**
 * The result logic of v1.1, copied from legacy/grown-v1.1-index.html and changed
 * only so it returns data instead of HTML. The parity test runs this beside the
 * new engine for every possible set of answers. Do not "fix" anything in here:
 * it is the record of what v1.1 did.
 */

type S = Record<string, string | undefined>;
type Fit = true | false | null;

export interface OracleResult {
  whatLead: string;
  what: string;
  next: string;
  nextWhy: string;
  urgent: string[];
  opts: { title: string; fit: Fit; short: string; body: string; src: string }[];
  watch: string[];
  used: string[];
  showDate: boolean;
}

export const V11_QUESTIONS: { k: string; a: string[]; only?: (s: S) => boolean }[] = [
  { k: "where", a: ["lb", "lac", "ca", "out"] },
  { k: "kind", a: ["moving", "fixit", "parking", "unsure"] },
  { k: "sev", a: ["m", "i", "cant"], only: (s) => ["moving", "fixit", "unsure"].includes(s.kind!) },
  { k: "date", a: ["future", "passed", "none"] },
  { k: "school", a: ["no", "yes", "unsure"], only: (s) => !["fixit", "parking"].includes(s.kind!) && s.sev !== "m" },
  { k: "cdl", a: ["no", "yes"], only: (s) => !["fixit", "parking"].includes(s.kind!) && s.sev !== "m" },
  { k: "money", a: ["ok", "tight", "no"] },
];

export function v11Result(S: S): OracleResult {
  const used = new Set(["selfhelp"]);
  let whatLead = "", what = "", next = "", nextWhy = "";
  let opts: OracleResult["opts"] = [];
  const watch: string[] = [];
  const urgent: string[] = [];
  const opt = (title: string, fit: Fit, short: string, body: string, src: string) => ({ title, fit, short, body, src });
  const court = S.where === "lb" || S.where === "lac" ? "the Superior Court of Los Angeles County" : "the superior court in the county where you got the ticket";

  if (S.where === "out") {
    whatLead = `Explainer only covers California tickets so far.`;
    what = `Explainer version one only covers California, starting with Long Beach. Tickets are handled by the courts in the state where you got them, so the rules here may not apply to you.`;
    next = `Look up the court named on your ticket and check its due date today.`;
  } else if (S.kind === "parking") {
    used.add("lb");
    whatLead = `A city parking ticket, not a court case.`;
    what = `A parking ticket is not a court case in Long Beach. It's handled by the City of Long Beach, not the traffic court. It won't go on your driving record, but unpaid parking tickets can add penalties and block your car registration.`;
    next = `Go to the City of Long Beach website and look up your parking citation by its number.`;
    nextWhy = `Explainer version one is built for court traffic tickets. Parking help is coming in a later version.`;
  } else if (S.sev === "m") {
    used.add("fta");
    whatLead = `A serious ticket. You have to go to court.`;
    what = `If the officer marked it as a misdemeanor, or the ticket says you must appear, this is more serious than a regular traffic ticket. You usually can't just pay it online. You have to go to court on your date.`;
    next = `Put your court date in your phone right now, and plan to be at the courthouse in person.`;
    nextWhy = `For a misdemeanor, talking to a lawyer is worth it. If you can't afford one, ask the court about a public defender when you appear.`;
    watch.push(`Missing a court date you promised to appear for can be its own separate misdemeanor (Vehicle Code § 40508). This is the most expensive mistake people make.`);
  } else {
    used.add("lasc");
    whatLead = S.kind === "fixit" ? `A fix-it ticket: fix it, prove it, pay a small fee.` : (S.sev === "cant" ? `Likely a regular ticket. Check the box first.` : `A regular ticket. Not criminal, but it has a deadline.`);
    what = S.kind === "fixit"
      ? `A fix-it ticket (also called a correctable violation) means the officer saw something you can fix, like a broken light or expired tags. If you fix it and show proof, you usually just pay a small fee instead of the full fine.`
      : `This is a traffic infraction, the most common kind of ticket. It's handled by ${court}. ${S.where === "lb" ? "Long Beach tickets go to the LA County court system, not the City of Long Beach." : ""} You are not in criminal trouble, but you do have to deal with it by the date on your ticket.`;

    if (S.sev === "cant") urgent.push(`Check one box before you pay.|Until you know if it's a misdemeanor, don't assume you can pay online. Look it up on the court site, or ask the traffic clerk.`);
    if (S.date === "passed") {
      used.add("fta");
      urgent.push(`Your date passed. Act this week.|Missing your date doesn't make the ticket go away. The court can add penalties, and if you promised to appear and didn't, that can become a separate misdemeanor (Vehicle Code § 40508). The fix is still the same: contact the court as soon as you can. Courts see this all the time.|After a missed date you may lose the choice of traffic school, so ask the clerk what is still open to you.`);
      next = `Look up your ticket on the LA County court's traffic website today, using your citation number or driver's license number.`;
      nextWhy = `It shows what you owe now and which options are still open. If it isn't online, call or visit the court's traffic clerk.`;
    } else if (S.date === "none") {
      next = `Look up your ticket on the LA County court's traffic website using your citation number or driver's license number.`;
      nextWhy = `If nothing shows up yet, that's normal. The court mails a notice with your amount and options, and it can take 30 days or longer. Your ticket may also show a date to appear. Don't wait for the letter if that date is coming.`;
    } else if (S.kind === "fixit") {
      next = `Fix the problem, then get the proof of correction signed before your date.`;
      nextWhy = `The back of your ticket says who can sign it off. Then you send the signed proof to the court with the fee.`;
    } else {
      const schoolOk = S.school === "no" && S.cdl !== "yes";
      if (S.money === "no" || S.money === "tight") {
        next = schoolOk
          ? `First ask for traffic school. Then, if the amount is too much, ask the court to lower it with MyCitations.`
          : `Ask the court to lower the amount, or for a payment plan or more time, using MyCitations.`;
        nextWhy = schoolOk
          ? `Order matters: the state's guide says to ask for traffic school before you ask for a reduction.`
          : `You'll answer questions about your income and expenses. You can also ask for community service.`;
      } else {
        next = schoolOk ? `Look up your ticket and choose traffic school before your due date.` : `Decide by your due date: pay it, or fight it if you believe you didn't do it.`;
        nextWhy = schoolOk ? `It keeps this ticket off your public driving record, which helps keep your insurance from going up.` : `Paying counts as a conviction on your driving record.`;
      }
    }

    if (S.kind !== "fixit") {
      used.add("tvs"); used.add("myc"); used.add("tbd");
      const schoolFit: Fit = S.cdl === "yes" ? false : S.school === "yes" ? false : S.date === "passed" ? null : S.school === "no" ? true : null;
      opts = [
        opt("Traffic school", schoolFit, `Keeps it off your public record. Once every 18 months.`, `You pay the full amount plus a court fee and the school's own fee, then take a DMV-approved class. The ticket stays confidential, off your public record. ${S.school === "unsure" ? "You said you don't remember: the 18 months count from the date of your old ticket to the date of this one." : ""} ${S.cdl === "yes" ? "Commercial drivers usually can't use traffic school this way." : ""}`, "tvs"),
        opt("Ask to lower the amount", S.money === "ok" ? null : true, `Ask for less, a payment plan, or more time.`, `If paying would be hard, ask the court for a lower amount, a payment plan, more time, or community service. You can do it online with MyCitations. You'll be asked to enter a plea, so if you plan to fight the ticket, don't ask for a reduction first.`, "myc"),
        opt("Fight it", null, `Plead not guilty, in person or in writing.`, `If you believe you didn't do it, you can plead not guilty and have a trial in person, or a trial by written declaration, where you send your side in writing. For a written trial you usually pay the amount up front and get it back if you win.`, "tbd"),
        opt("Just pay it", S.money === "ok" && schoolFit !== true ? true : null, `Fastest, but it goes on your driving record.`, `The fastest way to close it. It counts as a conviction, goes on your driving record, and can raise your insurance.`, "selfhelp"),
      ];
    } else {
      opts = [
        opt("Show proof and pay the fee", true, `Fix it, get it signed off, pay a small fee.`, `Fix it, get it signed off, and send the proof to the court with the small fee by your date.`, "selfhelp"),
        opt("Fight it", null, `Contest it like any other ticket.`, `If you don't think the ticket is right, you can contest it like any other ticket.`, "tbd"),
      ];
    }
    watch.push(`The court's notice goes to the address on your ticket. If that's your parents' house, check the court website yourself so you aren't surprised.`);
    if (S.kind !== "fixit") watch.push(`Traffic school is not a free pass. You still pay the full amount, plus a court fee, plus the school.`);
    watch.push(`The court will never text, call, or email you asking for payment. Only pay on the court's own website.`);
    watch.push(`Explainer doesn't show fine amounts. The real amount is on your court notice or the court website, and it's often much higher than the base fine because of added fees.`);
  }

  return { whatLead, what, next, nextWhy, urgent, opts, watch, used: [...used], showDate: S.date !== "passed" && S.where !== "out" };
}
