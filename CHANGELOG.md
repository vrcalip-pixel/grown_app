# Changelog

## Phase 3, step 3: built-in answers for Ask Grown (approved by the author and live, Nov 22, 2026)

Ask Grown now works with no AI key and no internet beyond loading the page.

### Added
- **Built-in questions** on the plan page. A person taps one and the answer appears, with its sources. The answers are in the guide pack, written from facts already there, and the rules engine picks which ones apply.
- Ten questions in the pack. A person sees between one and six, depending on their plan: "What do I do first?", what the key word on their ticket means, "What if I miss my date?", "What is traffic school?", "What is MyCitations?" and "How much will this cost?".
- "What do I do first?" repeats the plan's next move word for word, so it can never disagree with the plan.
- "How much will this cost?" returns the fixed line: Grown doesn't guess amounts or dates.
- Someone with a misdemeanor is never offered the traffic school or MyCitations questions.
- 7 new tests (65 total).

### Changed
- The typed-question box (the AI layer from step 2) now sits under the built-in questions and only appears when a key is set. Its opt-in notice is unchanged.
- Tapping a built-in question sends nothing anywhere.

### Still true
- The AI layer has never been run against the real model. The guardrail evals have not run.

## Phase 3, step 2: Ask Grown typed questions (code is live but switched off: no API key is set, evals not run)

Not yet run against the real model. Everything below is tested with stand-in replies only.

### Added
- **Ask Grown** panel on the plan page. A person can ask about their own plan in their own words.
- **Opt-in notice.** The panel stays closed until the person has read what is sent (their question and the answers they tapped, to Claude) and chosen to go ahead.
- **Grounding.** The model is given only the facts and text the rules engine showed this person. A misdemeanor result never includes traffic school facts, so the model cannot bring them up.
- **Reply checker** (`src/guide/check.ts`), plain code with no AI. Before a person sees a reply it must: cite at least one fact, cite only facts this person was shown, contain no money words or symbols, contain no number that is not in the verified text, contain no length of time ("a few weeks") that is not in the verified text word for word, and stay under 130 words.
- **Fixed lines** in the pack for amounts and dates, off-topic questions, blocked replies and outages. The model never writes these.
- **Sources under every answer**, taken from the facts the answer cited.
- **Server route** `/api/guide`. The key stays on the server. Requests are size-limited and rate-limited, and nothing in them is logged or stored.
- **31 new tests** that feed the checker rule-breaking replies (58 total).
- **Guardrail eval suite** (`npm run eval`): 23 adversarial questions for 3 kinds of ticket, sent to the real model. Not run yet.

### Behavior without a key
- The panel does not appear and the rest of Grown works as before.

## Phase 3, step 1: Read this to me (approved by the author and live, Nov 22, 2026)

### Added
- A "Read this to me" button on every screen. It speaks the words on screen with a voice built into the person's own device, and becomes "Stop reading" while it talks.
- It reads only what is visible. Text behind a closed "Show more" is not read until the person opens it.
- It stops by itself when the person moves to another screen.
- No AI and no network. If a device only offers voices that send text to a server, the button does not appear.

## Phase 2: polish from tester feedback (approved by the author and live, Nov 22, 2026)

Responds to the tester's two pain points: "there was a lot of words" and "a government app."

### Changed
- **Summary first, everywhere.** Each card now has a small label and one bold line. Urgent cards show their headline and keep the detail behind "Show more." "Why Grown asks" is one tap away on every question except the money question, where it stays visible.
- **Home screen.** One sentence instead of two paragraphs. The promise "Grown is not the court, the police, or immigration" is now its own panel, with the five privacy points as a short checklist.
- **Calmer look.** Progress bar and tags use coastal blue. Amber and red now appear only on warnings and on the keyboard focus ring.
- **Motion.** Screens and "Show more" ease in over 200ms. Buttons give a small press response. All motion is off for people who ask their device for reduced motion.
- **Dark mode.** "Show more" links were hard to read on dark cards. Fixed.
- **Screen readers.** Each new screen moves focus to its heading, so the new question is announced. Urgent cards are announced as alerts.
- The progress bar now counts the question you are on, so question 1 no longer shows an empty bar.

### Not changed
- No rule, fact or source changed. Pack is still 1.2. The only pack addition is `why_visible: true` on the money question.

## Pack 1.2 (approved by the author and live, Nov 22, 2026)

### Fixed
- Misdemeanor with a date that already passed. v1.1 showed no urgent card and told the person to put the court date in their phone. Now it shows an urgent card ("Your court date passed. Act today.") and the next move is to call or go to the court today. The date counter and the repeated § 40508 warning are hidden on this path.
- The wording uses only facts already in the pack (`missed-date`, `fta-40508`, `must-appear`, `public-defender`). No new legal claim was added. Two of those four still carry `confirm_source`.
- 27 tests. The parity test skips this one path, which now has its own test.

## 1.2.0 (in progress): Phase 1, parity

Port of v1.1 into the new stack. What a person sees is the same as v1.1, with the differences listed below.

### Added
- Next.js (App Router), TypeScript, Tailwind project, ready for Vercel.
- Guide pack for the Long Beach traffic ticket (`content/guides/traffic-ticket-long-beach.yaml`): 7 questions, 4 branches, 27 facts, 7 sources.
- Preview pack for the first lease guide. A preview pack cannot hold results.
- Pack schema and validator. The build fails if a fact lacks a source, a check date, a checker or an operative date, or if a block states a rule and cites no fact.
- Rules engine with operative-date filtering.
- 26 tests, including a parity test that runs the v1.1 logic beside the engine on all 1,080 answer paths.

### Different from v1.1 on purpose
- Photo reading is not in this build. v1.1 used a Claude artifact feature that does not exist outside claude.ai. It returns in phase 4 through a server route. The footer line about photos is removed until then.
- The source list on fix-it results now includes every source shown on the page (v1.1 left out one or two).
- Manrope is served from the app itself, so a visit no longer calls Google Fonts.

### Known issues carried over from v1.1 (not fixed yet, need a decision)
- The money question is asked on the parking, misdemeanor and outside-California paths, where the answer is not used. The date question is asked on the outside-California path.
- A fix-it ticket with a missed date is told it may lose traffic school, which does not apply to fix-it tickets.
- Ten facts carry `confirm_source: true`: v1.1 did not say which page backs them. The validator lists them on every build.
