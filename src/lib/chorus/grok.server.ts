export type GrokJson = Record<string, unknown>;

type ResponsePayload = {
  status?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

function outputText(payload: ResponsePayload): string {
  const chunks: string[] = [];
  for (const item of payload.output ?? []) {
    if (item.type !== "message") continue;
    for (const block of item.content ?? []) {
      if (block.text) chunks.push(block.text);
    }
  }
  return chunks.join("\n").trim();
}

export function extractJson(text: string): GrokJson | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as GrokJson;
  } catch {
    return null;
  }
}

export async function grokComplete(opts: {
  system: string;
  prompt: string;
  tools?: Array<Record<string, unknown>>;
  maxOutputTokens?: number;
  timeoutMs?: number;
}): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("AI is not available in this environment");

  const res = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      store: false,
      max_output_tokens: opts.maxOutputTokens ?? 1600,
      reasoning: { effort: "low" },
      tools: opts.tools ?? [{ type: "web_search" }],
      input: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.prompt },
      ],
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 90_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`xAI API error ${res.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`);
  }
  const payload = (await res.json()) as ResponsePayload;
  const text = outputText(payload);
  if (!text) throw new Error("Empty model response");
  return text;
}
