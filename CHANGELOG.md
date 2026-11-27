# Changelog

## A cooler background (live, Nov 26, 2026)

- The glowing horizon and the rising points of light are now cool blue in place of fire orange. The shapes and movement are unchanged.
- Why: orange and red read as heat and alarm, and in Grown they are also the colours of the warning cards. Blue is calmer and matches the app's buttons, and it leaves orange to mean "pay attention" only.

## Ripple removed (live, Nov 26, 2026)

- The ripple that spread across the page from each tap is removed for now; it was too distracting. The light vibration on phones stays. The ripple can be brought back from the project history.

## Home cards: a reassuring line and a short list (live, Nov 26, 2026)

- Each home card now shows a short list of what is inside beside its icon (for example: Traffic tickets, DMV notices, Registration), then the section name, then one reassuring line.
- The lines: "Let's sort out that ticket, one step at a time." (Car), "Let's get your home paperwork handled." (Housing), "Let's make sense of that bill before you pay." (Health), "Let's figure out where your money is going." (Money).
- The lines are about understanding the paper, not promising an outcome, on purpose.
- The "1 live" and "3 previews" tags moved down beside each section name.
- New Spanish and Khmer for these lines was written during the build and is not yet reviewed.

## Plain names for the four sections (live, Nov 26, 2026)

- The sections are now **Car, Housing, Health and Money**, replacing Auto, Residences, Medical and Finance. The aim is the word a person would actually say.
- In Spanish: Carro, Vivienda, Salud, Dinero. In Khmer, Money is now "លុយ"; the other three were already plain.
- Addresses changed to match: `/car`, `/housing`, `/health`, `/money`. The ticket guide is now at `/car/traffic-ticket`. Old links to the previous addresses no longer work.
- 21 new voice clips were made for the renamed lines.

## Menu at the far right; trust promise folded into the fine print (live, Nov 26, 2026)

- The grid menu now sits at the top far right, after the language switch. On a phone it stays at the top right beside the Grown name, and the language switch has its own row underneath.
- The "Grown is not the court, the police, or immigration" panel is gone from the home page. Its promises are now the opening of the fine print at the bottom of every page, with the lead sentence in bold and nothing said twice.
- The fine print reads, in order: who Grown is not and what it does; what it never asks for or keeps; that it never makes up fees or dates; and the credit line.

## Slower language glide; ripple only on the page (live, Nov 26, 2026)

- The highlight in the language switch now glides across in about two thirds of a second, easing in and out.
- The ripple starts only from taps on the page itself. Taps in the header (menu, languages, speaker) or the footer no longer start one.

## A slower, quieter ripple (live, Nov 26, 2026)

- The tap ripple is now three thin rings that spread slowly, like a pebble dropped in still water, over about three seconds. The glow is gone; each ring only softly bends what it passes over.

## Always dark, embers, a ripple on every tap (live, Nov 26, 2026)

- **Dark only.** Grown now always shows its dark look. The light/dark switch is gone from the header.
- **Embers.** The background's drifting specks are now embers: they lift off near the glow at the bottom, rise, sway, flicker and fade, all the time the page is open. The glowing horizon stays.
- **Ripple.** Tapping any button or card sends a ring of light across the whole page from the spot that was tapped.
- **Language switch.** The highlight now slides from one language to the next instead of jumping.
- Embers and the ripple hold still for anyone whose device is set to reduce motion, and the embers pause while the tab is in the background.

## Grid menu and a quieter speaker (live, Nov 26, 2026)

- The header's separate Auto, Residences and Sources buttons are replaced by one grid button. It opens a panel with every section: Auto, Residences, Medical, Finance and Sources. A new section added later appears there by itself.
- The language switch now spells out each language in its own script (English, Español, ខ្មែរ) instead of EN and ES. Flags were considered and set aside: a flag stands for a country, not a language, and Spanish has no single one.
- The read-aloud control is now just the speaker symbol, with no button outline, so it sits quietly beside the Grown name.

## Read aloud in the author's own voice (live, Nov 26, 2026)

- The speaker button now plays recorded clips in Vincent Calip's own cloned voice instead of the device's built-in voice: 322 lines in English and 178 in Spanish, covering every page and every path through the ticket guide.
- The clips are audio files on the Grown site itself. A visitor never contacts the voice service, and nothing they tap or read is sent anywhere.
- A line with no clip (for example, the sentence built from a date you type) and all Khmer still use the device voice.
- After a wording change, run `npm run voice` to make clips for the new lines.
- Small fix along the way: an option's title and its "Good fit for you" tag are now read as two separate phrases instead of run together.

## Read aloud moves into the header (live, Nov 26, 2026)

- "Read this to me" is no longer a line of text above every page. It is now a round speaker button next to the Grown name in the header, on every page including the ticket guide.
- Tap it to hear the current screen; tap again to stop. It still stops by itself when you move to another screen, and it still appears only when the device has its own voice for the language.
- Page titles now sit closer to the header.

## Bottom-of-page text now follows the language switch (live, Nov 26, 2026)

- The fine print at the foot of every page was fixed English text. It now changes with the language switch, in English, Spanish and Khmer.
- The "Grown is not the court, the police, or immigration" panel had Spanish but no Khmer. Khmer added.
- Five small Khmer gaps filled: "Read this to me," "Stop reading," the light-mode and language labels, and the note that the ticket guide is in English for now.
- All of the new Spanish and Khmer was written during the build and has not had a human review.

## Work & Money becomes Finance (live, Nov 26, 2026)

- The **Work & Money** section is now called **Finance** ("Finanzas" in Spanish, "ហិរញ្ញវត្ថុ" in Khmer), with a dollar sign as its icon.
- Its address changed from `/work-money` to `/finance`. The three previews inside it are unchanged.

## Home page tidy-up and two new preview sections (live, Nov 26, 2026)

- **Auto icon** is now a recognisable car, on the home card, the Auto page and the header.
- **Bigger icons** on every card, so each section is easier to spot.
- **Home page order** is now title, subtitle, the four section cards, then the "Grown is not the court, the police, or immigration" panel at the bottom, just above the fine print.
- **Header logo** is a plain "Grown" wordmark. The tree and vine animation was removed because it made the name hard to read.
- **Credit line** now reads "Built by Vincent Calip."
- **Medical** and **Work & Money** are no longer "Coming next." Each has its own page and three previews with their own pages:
  - Medical: a hospital or clinic bill, a letter from your health insurance, an itemized statement.
  - Work & Money: a tax form in the mail, paycheck and deductions, a benefits letter.
- The six new previews were written during the build in English and Spanish. They describe what each guide will cover and state no rules, amounts or deadlines. They have no Khmer yet and fall back to English. The Spanish has not had a human review.

## Merge of the author's FYI build (approved by the author and live, Nov 26, 2026)

The author built a second version of Grown on the FYI platform. This brings its structure, pages and languages into this version, on top of this version's verified rules.

### Brought over from the FYI build
- **Category home screen:** Auto, Residences, Medical, Work & Money, with the headline "Nobody hands you a manual for this. We got you."
- **Real pages with their own addresses:** Home, Auto, the ticket guide, Residences, five housing previews, and Sources. A direct link or a refresh works on every one.
- **Header navigation** with icons for Auto, Residences and Sources.
- **Three languages:** English, Spanish and Khmer, with a switch on every page. The page also starts in Spanish or Khmer if that is the phone's language.
- **Five housing previews:** first lease, security deposit, repairs, notices and rent increases, roommates. They replace the single lease preview.
- **Sources page** listing the seven official sources.

### Kept from this version
- The ticket guide's rules engine, verified guide pack and all tests. The guide asks the same questions and gives the same plans as before.
- The promise "Grown is not the court, the police, or immigration" stays on the home screen. The FYI build had dropped it.
- Read this to me, Ask Grown, the dawn background, the animated logo, the light and dark fade and tap vibration.

### Deliberately not brought over
- **New legal wording on the FYI plan pages,** such as "can trigger a warrant" and "free court staff." These have no source in the verified facts and need the author to source them first.
- **Em dashes** in the FYI copy were replaced with periods and commas.
- **Translated source titles.** Official source names stay in English.

### Not finished
- **The ticket guide itself is English only.** In Spanish or Khmer it shows a short note saying so. Its rules need a human-reviewed translation.
- **No Spanish or Khmer text has had a human review.** The author chose to go live with it on Nov 26, 2026, as it was already public on the FYI site. It came from the FYI build, plus about ten Spanish lines written during the merge (the trust promise, read-aloud labels, the English-only note). A few lines have no Khmer yet and fall back to English.
- **Read this to me** follows the page language and hides when the device has no on-device voice for it, which is likely for Khmer.

## Dawn-horizon background and tap vibration (live, Nov 26, 2026)

- **New background.** A wide, curved rim of warm light sits low on the page, like first light coming over the edge of a world, with slow motes of light drifting above it and one small star. In dark mode it is a night sky; in light mode a pale dawn. It replaces the three color pools.
- **It still breathes.** The glow along the horizon swells and settles at the same resting-breath pace as before.
- **Inspired by, not copied from,** the background of the Artie app, which the author shared as a reference. Nothing from that app is used: the scene is drawn from scratch in styles, with no images.
- **Text stays readable.** Words that sit directly on the sky get a soft halo of sky color, and the page now ends above the horizon so the last lines never rest on the bright rim.
- **Tap vibration.** Buttons give a light tick of vibration on phones that allow it. Android uses the standard vibration feature. iPhone Safari has none for web pages, so a known workaround is used there; it may not work on every iPhone, and if it doesn't the tap is simply silent. Desktops do nothing.
- People who set their device to reduce motion get a still scene.

## Softer buttons, a fading theme switch, a better voice, a richer logo (live, Nov 23, 2026)

- **Button shadows are subtler.** The hard edge under each button is gone. Buttons now float on a wide, blurred shadow, and move less on hover and press.
- **Light and dark now fade into each other** over about a second, where before the switch was instant.
- **Read this to me picks the most natural voice on the device.** It ranks the device's own voices and prefers the newer "natural", "enhanced" and "premium" ones, then the better standard voices, and never a novelty voice. It also reads slightly slower. It still uses on-device voices only.
- **The logo was redrawn and slowed down** to about eight seconds. The tree now has a tapered trunk, branches and a shaded crown. The vine grows through the letters of "Grown", passing behind some strokes and in front of others, and shaded leaves with veins unfurl along it one at a time.
- 4 new tests for the voice ranking (69 total).

## Animated logo: seed to tree (live, Nov 23, 2026)

- The header logo now tells the name's story in about four seconds: a seed lands, a sprout comes up, the sprout becomes a small tree, and a vine grows from its roots and crown to wrap the word "Grown" in leaves. Then it holds still.
- Plays once when the page loads. A tap on the logo plays it again.
- Drawn as a vector, not a GIF: sharp at any size, follows light and dark mode, and adds almost nothing to the page weight.
- People who set their device to reduce motion see the finished tree and vine straight away.
- The six static logo concepts in `design/logo-options.svg` are kept for reference. None was applied.

## Raised buttons and a light/dark switch (live, Nov 23, 2026)

- **Raised buttons.** Every button now sits on a thin solid edge with a soft shadow beneath it, so it looks like it floats above the page. Hovering lifts it slightly, and pressing pushes it down onto the page. Applies to the answer choices, the main and secondary buttons, and the Ask Grown question chips. Disabled buttons stay flat.
- **Light and dark switch** in the header. The page starts in whatever the phone is set to; a tap flips it. The choice lasts for the visit and is not stored, in keeping with "nothing you tap is saved."

## Breathing background (live, Nov 23, 2026)

- The page background now breathes: three soft pools of coastal blue, sage and warm sand slowly swell and settle together behind the content, about five breaths a minute (in for about 4 seconds, a short hold, out for about 5).
- Strengthened the same day at the author's request: richer colours and a bigger swell. At rest the page is almost plain sand; at the top of the breath the colours bloom.
- The light-mode tints were chosen so small grey text on top still meets the 4.5:1 contrast standard at the deepest point. Cards stay solid.
- It is decoration only: hidden from screen readers and never in the way of a tap.
- People who set their device to reduce motion get a still version.
- Works in light and dark mode. No images, no libraries, nothing downloaded.

## Publishing: GitHub Pages (live, Nov 22, 2026)

- A static copy of Grown is now published from the GitHub repository at https://vrcalip-pixel.github.io/grown_app/.
- A GitHub Actions workflow validates the guide packs, runs all tests, and republishes on every push to the production branch. A failed test or an unsourced rule stops the publish.
- The static copy has no server. Everything works except typed AI questions, which were already switched off.
- The Vercel site is unchanged.

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
