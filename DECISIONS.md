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

## 21. The Guide is one grounded model call, not an agent and not a search index
The whole context (this person's plan and its facts) is sent with each question.
**Why:** the pack is small enough to send whole, so there is no retrieval step to get wrong. Faculty recommended the split: rules engine decides, AI only explains.

## 22. The model sees only what the engine showed this person
Not the whole pack.
**Why:** the engine has already decided what applies. If the model could see traffic school rules while talking to someone with a misdemeanor, it could offer an option the engine deliberately withheld.

## 23. A plain-code checker stands between the model and the person
Any reply that fails is replaced by a fixed line. The checker fails closed: when unsure, it blocks.
**Why:** a prompt can ask a model not to invent a fee. Only code can guarantee the person never sees one. The cost is that some harmless replies get blocked (for example "you have two options", if written with a length of time). A blocked reply costs a moment. A wrong date can cost a court appearance.

## 24. Known limit of the checker
It checks that a number or length of time exists in the verified text. It cannot check that the number is used to mean the same thing. If a person's plan includes "30 days or longer" for the mailed notice, the model could misuse "30 days" as a deadline and the checker would pass it.
**Why this is written down:** the prompt, the grounding and the evals are the defense here, not the checker. This is the first thing to look for when evals run.

## 25. Refusal and handoff wording is fixed text in the pack
**Why:** these are the moments a person is most likely to be asking something risky. The author's words, reviewed once, are safer than fresh wording each time. It also means Spanish versions can be human-reviewed.

## 26. No streaming
**Why:** text cannot be shown before it is checked. Replies are short, so the wait is a few seconds.

## 27. Ask Grown is on the plan page only, not on question screens
This is narrower than first planned.
**Why:** before the plan exists there are no engine-chosen facts to ground on. Question screens already have "Why Grown asks."

## 28. Ask Grown is opt-in, with the notice shown every visit
**Why:** it is the only feature where something leaves the device. The home screen promise ("nothing you tap is saved") stays true, and the person learns exactly what is sent before sending anything.

## 29. Rate limiting holds a visitor's network address in memory for ten minutes
It is never written to a log, file or database.
**Why:** a public page in front of a paid model needs a brake. This is the least data that provides one. It is weak on its own, so a spend limit in the Anthropic console is the real backstop.

## 30. Model: Claude Opus 5.5 at low effort. Automatic fallback to another model is off
**Why:** chosen by the author for reliability at staying inside the given text. Fallback is off because if the model declines, the fixed "blocked" line is the right thing to show, and a second model's wording would be one more thing to evaluate.

## 31. Ask Grown has a layer with no AI in it, and that layer comes first
Built-in questions are answered from the pack by the rules engine. The typed-question AI layer sits on top and is optional.
**Why:** three reasons. It needs no key, so the feature exists today. It sends nothing off the device, so the core privacy promise holds for everyone who never opts in. And it is the fallback at the Showcase if the venue's internet or the AI service fails.

## 32. Built-in answers reuse wording the pack already had
Every built-in answer is assembled from sentences already approved elsewhere in the pack, and cites the same facts. "What do I do first?" is not written at all: it is the next move, repeated.
**Why:** new wording about legal consequences is where errors get in. Reuse means the author reviews it once.

## 33. Built-in answers do not add to the plan's source list
**Why:** "Where this comes from" describes what is on the page. An answer shows its own sources when it is opened.

## 34. Two published copies: Vercel (full) and GitHub Pages (static)
**Why:** GitHub Pages was asked for, and it is a useful second home: it depends on nothing but GitHub, costs nothing, and cannot run the AI layer by accident because it has no server. Vercel stays as the copy that can run typed AI questions once a key is set and the evals pass. If the two ever disagree at the Showcase, the GitHub Pages copy is the safer one to show.

## 35. A slow breathing background, at a resting-breath pace
The background swells for about 4 seconds, holds briefly, and settles for about 5, roughly five breaths a minute. The out-breath is longer than the in-breath.
**Why:** the tester asked for "a calming experience." Slow breathing with a longer exhale is a common pacing for calming exercises, and a person reading a court notice is often holding their breath. This is a design choice, not a health claim, and the app says nothing about it on screen.
**Trade-off to watch:** the same tester said their "ADHD brain is reading everything at the same time." Movement behind text can pull attention. It is kept very faint and slow for that reason, and it is the first thing to ask the next tester about. The earlier rule "motion under 300ms" still applies to anything a person triggers; this is ambient and never blocks or delays anything.

## 36. The light/dark choice is not remembered between visits
It is held in memory and resets to the phone's setting on the next visit.
**Why:** the home screen says "Nothing you tap is saved." Storing even a harmless preference on the device would make that sentence not literally true. If the author would rather it be remembered, the sentence needs a matching tweak.

## 37. Buttons are raised; cards are not
Buttons have an edge, a shadow and a press movement. Information cards stay flat.
**Why:** if everything floats, nothing does. Depth now means one thing: you can press this.

## 38. The animated logo is a vector animation, not a GIF, and it plays once
**Why not a GIF:** a GIF is a fixed-size picture with a fixed background. It would blur on sharp phone screens, could not follow light and dark mode, would weigh hundreds of times more, and could not be stilled for people who ask for less motion.
**Why once:** a logo that loops forever next to a court-notice explainer competes with the one thing the person came to read. It plays as a welcome, rests, and replays only if tapped. The breathing background is the only thing on the page that keeps moving.
