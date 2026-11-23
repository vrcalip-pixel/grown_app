# Decisions

Each entry: what was chosen, and why. Newest at the bottom.

## 1. Content lives in guide packs, not in code
All questions, rules and copy sit in one YAML file per guide. The engine and the screens contain no traffic-ticket knowledge.
**Why:** it is what lets one guide become many, and it gives the AI layer a closed set of text to speak from.

## 2. Rules are written as small data expressions (`eq`, `in`, `all`, `any`, `not`, `ref`)
**Why:** a rule written as data can be checked by the validator (does that question exist, is that a real answer) and read by a non-programmer reviewing the pack. A rule written as code can be neither.

## 3. Facts are separate from copy, and copy must cite them
A fact is one plain claim with `source`, `verified_on`, `verified_by` and `operative_date`. Every block that can state a rule lists the facts behind it, or declares `no_claim: true`. The build fails otherwise.
**Why:** principle 1, verified facts not model facts. In testing, the agent invented a deadline, fee figures, a processing time and a penalty range. This makes an unsourced claim a build error instead of something to catch by eye.

## 4. Operative dates are enforced by the engine, not by convention
A block citing a fact whose `operative_date` is in the future is dropped until that day.
**Why:** the agent once treated a law as in effect before its start date. A.B. 2746 (Jan 1, 2027) can be added now and will switch on by itself.

## 5. Existing rules use `operative_date: in_effect_at_verification`
**Why:** v1.1 recorded no enactment dates. Looking them up or guessing them would put unverified dates into the product. The marker says what is known: the rule was in effect on the day a person checked it.

## 6. `confirm_source: true` for facts v1.1 did not tie to a page
The pack was ported by an AI assistant. Where v1.1 did not say which source backs a claim, the assistant attached its best guess and flagged it. These show as warnings on every build until a person clears them.
**Why:** a guessed citation that looks verified is worse than a visible gap.

## 7. Parity is proven by running v1.1's own logic as a test oracle
`src/engine/__tests__/v11-oracle.ts` is v1.1's result function, changed only to return data. The parity test compares it with the engine on every reachable answer path.
**Why:** "must match v1.1 exactly" is a claim. This makes it a test.

## 8. v1.1's quirks were ported, not fixed
See "Known issues" in the changelog.
**Why:** phase 1 is parity. Each fix changes what a stressed person is told, so each one is a content decision for the author, not a side effect of a port.

## 9. The flow is one client screen with answers held in memory
No per-question URLs, no storage.
**Why:** it matches v1.1, and it keeps answers out of the address bar, browser history and server logs (principle 4).

## 10. v1.1 styles carried over as plain CSS beside Tailwind
**Why:** it gives exact visual parity today. Phase 2 redesigns the visual system, so rewriting every rule as utilities first would be work done twice.

## 11. Every string is `{ en, es }` from the start
**Why:** Spanish (phase 5) then needs no restructuring, and `es: null` makes "not reviewed by a human yet" visible in the data.

## 12. Stale answers are dropped before resolving
If a person goes back and changes an answer, replies to questions that are no longer asked are ignored.
**Why:** v1.1 kept them. It happened to be harmless there, but a future rule could read one.

## 13. The missed-date misdemeanor fix says nothing the pack had not already verified
The new card and next move are built from four existing facts. They do not mention warrants, license holds or any other consequence, even though a reader might expect them.
**Why:** those consequences have no verified source in the pack yet. A calm, true, shorter card beats a fuller one with an unsourced claim. If a source is verified later, the consequence can be added as a fact and cited.

## 14. Content changes go out on their own branch first
Vercel builds a preview URL for every branch, and production only changes when the branch is merged.
**Why:** a change to what a stressed person is told should be read by the author on a real screen before it is live.

## 15. Urgent detail sits behind "Show more" too
The urgent headline ("Your date passed. Act this week.") is always visible. The paragraph under it is one tap away.
**Why:** the tester said their "ADHD brain is reading everything at the same time." The headline carries the action, and the next move card sits directly under it. Trade-off: the § 40508 sentence is no longer visible without a tap on this card. Worth watching in the next round of testing.

## 16. "Why Grown asks" is collapsed, except where the question could feel intrusive
A pack can set `why_visible: true` on a question. Only the money question uses it.
**Why:** an earlier pressure test showed people need to see why money is asked before they will answer. For the other questions the reason is useful but not needed to answer, and showing all seven added to the wall of words.

## 17. Amber and red are reserved for warnings
The progress bar and fit tags moved from amber to blue.
**Why:** if amber decorates ordinary things, it stops meaning "pay attention" on the cards where that matters.

## 18. Focus moves to the heading on every screen change
**Why:** the flow is one page, so without this a screen reader stays on a button that has just disappeared and never announces the next question (WCAG 2.4.3). It replaces v1.1's live region, which re-read the whole screen.

## 19. Read-aloud uses only voices that run on the device
The button checks each voice's `localService` flag and hides itself if no English on-device voice exists.
**Why:** some browsers ship voices that send the text to a company's server to be spoken. Reading a person's result through one of those would break "nothing leaves your device" without anyone noticing. A missing button is better than a broken promise.

## 20. Read-aloud reads what is visible, nothing more
Closed "Show more" sections, navigation buttons and the feedback card are skipped.
**Why:** it keeps listening as summary-first as reading. A person who wants the detail opens it, then taps the button again.
