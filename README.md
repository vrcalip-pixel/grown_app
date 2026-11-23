# Grown

Start from the paper in your hand, answer a few plain questions, get one calm plan.
Built by Dr. Vincent Calip for ASU HDA 294/494, The Agentic Self.

First guide: a traffic ticket in Long Beach, CA.

**Live:** https://grown-app-iota.vercel.app (deploys from GitHub on every push)

## Run it

```
npm install
npm run dev        # http://localhost:3000
npm test           # rules engine, v1.1 parity, validator
npm run validate   # check every guide pack
npm run build      # validates first; a bad pack stops the build
```

## How it is put together

| Part | Where | Job |
| --- | --- | --- |
| Guide packs | `content/guides/*.yaml` | All questions, rules, copy and verified facts, as data |
| Schema and validator | `src/pack/` | Refuses any rule without a source, a check date and an operative date |
| Rules engine | `src/engine/` | Pure functions: answers in, result out. No AI, no generated text |
| Screens | `src/components/`, `src/app/` | Show what the engine returns |
| v1.1 | `legacy/` | The original single file, kept as the behavior spec |

See `DECISIONS.md` for the why behind each choice and `CHANGELOG.md` for what changed.
