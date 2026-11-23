# Changelog

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
- Misdemeanor plus "my date already passed" shows no urgent card, and the next move still says to put the court date in your phone.
- The money question is asked on the parking, misdemeanor and outside-California paths, where the answer is not used. The date question is asked on the outside-California path.
- A fix-it ticket with a missed date is told it may lose traffic school, which does not apply to fix-it tickets.
- Ten facts carry `confirm_source: true`: v1.1 did not say which page backs them. The validator lists them on every build.
