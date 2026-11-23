import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { RawReply } from "./check";
import type { ModelCaller } from "./ask";

/** Server only. The key is read from the environment and never reaches the browser. */

export const GUIDE_MODEL = "claude-opus-5-5";

export const guideAvailable = () => Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | null = null;

export const callClaude: ModelCaller = async (system, turns) => {
  client ??= new Anthropic({ timeout: 30_000, maxRetries: 1 });

  const response = await client.messages.parse({
    model: GUIDE_MODEL,
    // Thinking is always on for this model and shares this budget with the reply.
    max_tokens: 4000,
    // The task is rewording a short text, so low effort keeps replies quick.
    output_config: { effort: "low", format: zodOutputFormat(RawReply) },
    system,
    messages: turns.map((t) => ({ role: t.role, content: t.text })),
  });

  if (response.stop_reason === "refusal") return "refused";
  if (!response.parsed_output) throw new Error("Guide reply did not match the expected shape");
  return response.parsed_output;
};
