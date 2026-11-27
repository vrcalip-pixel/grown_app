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

## 39. A more natural voice, within the on-device rule
Read-aloud now ranks the voices a device already has and picks the best one. It still refuses voices that send text to a server.
**Why:** the truly lifelike voices are cloud services, and using one live would send a person's plan off their device. Ranking gets the best available without breaking that promise. How good it sounds depends on the device: recent iPhones, Macs and Android phones have good on-device voices; a Windows PC with only the basic voices will still sound robotic.
**Open option:** every sentence Grown can say is fixed text in the guide pack. A lifelike voice could read each one once, ahead of time, and the recordings could ship with the app. That would give a natural voice with nothing leaving the device. It needs a paid voice service for the one-time recording and the author's choice of voice.

## 40. The logo stays a drawing
The author asked for "hyper-realistic." A vector drawing can be shaded and detailed, and now is, but it cannot be photographic.
**Why not a video or rendered clip:** it would need a fixed background (so it could not follow light and dark or sit on the breathing background), would be far heavier, and could not be stilled for reduced motion. A photoreal clip is possible later as a separate hero piece if the author wants one.

## 41. The background is a dawn horizon, and the warm glow now belongs to it
The author shared the Artie app's background (a glowing planet rim on a night sky) as the look to aim for. Grown's version is an original drawing in the same spirit: first light on a horizon, which also fits the name.
**What this overrides:** decision 17 reserved amber for warnings. The horizon is warm amber and orange, so that rule no longer holds for the background. Warnings are still set apart by their bordered cards and their place at the top of the plan, but amber alone no longer means "pay attention." Worth watching with the next tester.
**What was not copied:** no image, artwork or code from the reference app. Only the idea of a glowing horizon with drifting points of light.

## 42. A light vibration on every button tap
**Why:** the author felt it in the reference app and it makes a web page feel like a real app in the hand.
**Limits, stated plainly:** web pages can vibrate Android phones through a standard feature. iPhones do not offer that to web pages; Grown uses a workaround (flipping a hidden switch, which recent iPhone Safari ticks for). It is harmless if it fails, but it is not guaranteed, and only testing on a real iPhone will tell. A guaranteed vibration on iPhone needs a real App Store app, not a web page.

## 43. Merge the FYI build's shape onto this version's rules, not the other way round
The author built a second Grown on the FYI platform with a category home, real pages, three languages and five housing previews. Those were brought in. The ticket guide's engine, verified pack and tests stayed as they were.
**Why:** the FYI build had the better structure; this build has the checked facts and the proof (tests, validator) that nothing unsourced ships. Replacing one with the other would lose one of those.

## 44. The FYI build's new legal wording was left out
Its misdemeanor plan said a missed date "can trigger a warrant," called the ticket "a criminal court charge," and said court staff are "free." None of that is in the verified facts.
**Why:** this is the exact failure the project was built to prevent: plausible legal statements with no source. They can come in as facts once the author attaches a source to each.

## 45. Pages have real addresses now
Each section and preview is its own page, built ahead of time.
**Why:** the FYI build showed a blank page when the ticket guide or a preview was opened by direct link or refreshed. Pages built ahead of time cannot do that. Answers inside the guide are still held in memory only and never appear in the address.

## 46. Languages: the shell is translated, the guide is not yet
The home, category, preview and sources pages switch between English, Spanish and Khmer. The ticket guide stays in English and says so.
**Why:** the author's own rule is that translations get a human review before going live, and a mistranslated rule is worse than an English one. The pages around the guide state no rules, so they carry less risk. Khmer was added because Long Beach has a large Cambodian community.

## 47. The language choice is not stored
It starts from the phone's own language and lasts for the visit.
**Why:** same reason as the light and dark choice: "Nothing you tap is saved" stays literally true.

## 48. The trust promise moved to the foot of the home page
The author asked for title, subtitle, section cards, then the "Grown is not the court, the police, or immigration" panel, just above the fine print.
**Trade-off:** the original handoff said to "say the quiet part on screen one," and an earlier pressure test asked for a privacy promise on the first screen. On a phone the panel is now below the first screenful. It is still on the home page and still reached before anything is asked. Worth watching with the next tester: do people who worry about who is behind the app still find it?

## 49. Medical and Work & Money previews are outlines, not content
They were written during the build, not carried over from a verified source. Each line says what the guide will cover ("the due date printed on the bill") and none says what the rule is.
**Why:** it lets people click around all four sections at the Showcase without putting a single unverified rule in front of them. The line "Grown points to the numbers and never estimates them" is repeated on each cost question on purpose.
**One tension to resolve before these go live as real guides:** the handoff ruled out income and benefits questions. A paycheck or benefits-letter guide will have to work from what is printed on the paper, without asking the person about either.

## 50. The animated logo was retired
It was built at the author's request and removed at the author's request, because the tree and vine made the name hard to read at header size.
**Why keep a note:** a plain wordmark is the right call for a header. If the animation returns, it belongs somewhere with room, such as a splash screen, not beside the navigation.

## 51. Read aloud uses the author's own voice, recorded ahead of time
The device voices sounded robotic, so the speaker button now plays clips in Vincent Calip's cloned voice (made with ElevenLabs from his own recording).
**How it keeps the privacy promise:** the clips are made once on the author's computer with `npm run voice` and saved as plain audio files on the Grown site. When a visitor taps the speaker, their phone only fetches those files from Grown. Nothing they read or tap goes to ElevenLabs or anyone else, and no AI runs at that moment.
**How it keeps the facts rule:** the voice only reads lines that are already on screen, word for word. The list of lines (`content/voice/lines.json`) was collected by walking every page and all 1,080 answer paths of the ticket guide.
**What falls back to the device voice:** a line with no clip, such as the sentence built from a date the person types, and all Khmer. If a wording change is published without running `npm run voice` again, the new line is read by the device voice until the clips are remade.
**Not yet done:** nobody has listened to all 500 clips. A cloned voice can mispronounce a word or a court name, so the ticket guide clips need a listen before the Showcase.

## 52. Dark only, with a livelier background
The author chose the dark look as the one look, for its contrast, and removed the light/dark switch. The background gained rising embers and every tap now sends a ripple across the page.
**Why it is safe to do:** the embers and ripple are decoration behind and above the page. They never take a tap, they stop for people who ask their device for less motion, and the embers pause in a background tab to save battery.
**Trade-offs to watch:** an earlier rule said motion should be "gentle and fast, 250ms or less" and the app should feel calm. The embers move constantly and the ripple lasts about a second. Someone reading a stressful notice in bright sunlight may also find a dark screen harder to read than a light one, and there is no longer a way to switch. Worth asking the next testers about both.

## 53. The trust promise now lives in the fine print
The author asked to simplify the home page by folding the "Grown is not the court, the police, or immigration" panel into the footer text, without repeating anything. It now opens the fine print on every page, with that first sentence in bold.
**What was gained:** a simpler home page, and the promise now appears on every page, including inside the ticket guide, where before it was on the home page only.
**Trade-off:** this is the second step away from the handoff's rule to "say the quiet part on screen one" (see decision 48). The promise went from a panel at the top, to a panel at the bottom, to small print. A first-time visitor who is wary of who is behind the app is now less likely to see it before they start. Worth testing with the next few people: after using Grown, can they say who it is not?

## 54. No category sorter on the home page, for now
The author asked whether the home page needs a quiz or other wayfinding aid to help people pick a category. Decided on Nov 26, 2026 to hold off.
**Why:** with four cards, each showing a plain name and three examples, the grid is already the wayfinder. A quiz in front of it adds a step, and the home page had just been simplified.
**What to watch for:** testers hesitating over which card to tap.
**What to build if they do:** one question under the intro, "Not sure where your paper goes? Who sent it?", with one-tap answers (a court or the police, the DMV, a landlord, a hospital or insurer, an employer or tax office) that lead to the right category. No typing, nothing stored. Ruled out: a multi-question quiz, a search box, and sorting from a photo (it would need AI to read a personal document).

## 55. The second live guide is a first lease, built to the same rules as the ticket
The author asked for a live Housing guide so testers can see the pattern work on a second kind of paper.
**What was kept the same:** every rule is a fact with a source link and a check date; the engine decides and no AI writes any of it; one next move; no amounts invented. The lease guide states one legal limit as a rule ("no more than one month's rent") because the state guide states it that way, and it gives no dollar figures.
**What is different, and honest about it:** the ticket facts were checked by the author. The lease facts were read off official pages by an AI research pass in one sitting, so all 23 are flagged as needing a human check and the file says who really did the reading. It was built on a branch and held for approval under the standing rule for anything that adds a legal claim.
**Left out on purpose:** roommate and co-signer liability, the screening-fee dollar limit, and local rent control, because the pages read did not support a plain statement. A guide that says less is better than one that guesses.
**Privacy check:** the guide asks how the up-front total compares to one month's rent. It does not ask what the rent is or what the person earns, and it says so on that screen.
**Known gap:** typed questions in Ask Grown (the AI layer, still switched off) are wired to the ticket guide only. They must be pointed at the right guide before that layer is ever turned on.

## 56. The name changed from Grown to Explainer
"Grown" came from the feeling of being grown after handling adult paperwork. The author decided it read as tongue-in-cheek and aimed too narrowly at young people, when the real subject is navigation: finding your way through procedures nobody teaches.
**How the name was chosen:** several rounds of options (Bearings, Signpost, Paper Compass, Made Plain, Simplify) were set aside as ambiguous or already in use. "Explainer" says what the app does in one word, and explainer.guide was available.
**One limit of the name, noted on purpose:** the app does two things. It explains the paper, and it gives one next move. "Explainer" names only the first, so taglines and the pitch should say the second out loud.
**The mark:** a four-point compass star, keeping the wayfinding idea the author liked without a dial and needle.
**Not renamed:** the code repository, the project folder and the older web addresses. Renaming them would break links for no visible gain.
