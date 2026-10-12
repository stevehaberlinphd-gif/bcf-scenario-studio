// Netlify function: same job as api/claude.js (Vercel), served at /api/claude.
// Requires the ANTHROPIC_API_KEY environment variable in Netlify.

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json(
      { error: "missing_key", message: "ANTHROPIC_API_KEY is not set in Netlify." },
      { status: 500 }
    );
  }

  let body = {};
  try { body = await req.json(); } catch (e) { body = {}; }
  const prompt = String((body && body.prompt) || "");
  const schema = body && body.schema && typeof body.schema === "object" ? body.schema : null;
  if (!prompt) return Response.json({ error: "empty_prompt" }, { status: 400 });
  if (prompt.length > 20000) return Response.json({ error: "prompt_too_long" }, { status: 413 });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 2500,
        messages: [{ role: "user", content: schema
          ? prompt + "\n\nGive your answer by calling the respond tool, not as text."
          : prompt }],
        ...(schema ? {
          tools: [{ name: "respond", description: "Return the structured answer. Always use this tool to answer.", input_schema: schema }]
        } : {})
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const code = r.status === 429 ? "rate_limited"
        : (r.status === 401 || r.status === 403) ? "invalid_key"
        : "upstream_error";
      return Response.json(
        { error: code, message: (data && data.error && data.error.message) || ("Claude API returned " + r.status) },
        { status: r.status === 429 ? 429 : 502 }
      );
    }
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const tool = (data.content || []).find((b) => b.type === "tool_use");
    return Response.json(tool ? { text, data: tool.input } : { text });
  } catch (e) {
    return Response.json({ error: "network_error", message: String((e && e.message) || e) }, { status: 502 });
  }
};

export const config = { path: "/api/claude" };
