// Vercel serverless function: forwards a prompt to the Claude API.
// Requires the ANTHROPIC_API_KEY environment variable in Vercel.
// Optional: ANTHROPIC_MODEL to override the default model.

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "missing_key", message: "ANTHROPIC_API_KEY is not set in Vercel." });
  }

  var body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body || "{}"); } catch (e) { body = {}; }
  }
  var prompt = String((body && body.prompt) || "");
  var schema = body && body.schema && typeof body.schema === "object" ? body.schema : null;
  if (!prompt) return res.status(400).json({ error: "empty_prompt" });
  if (prompt.length > 20000) return res.status(413).json({ error: "prompt_too_long" });

  try {
    var r = await fetch("https://api.anthropic.com/v1/messages", {
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
    var data = await r.json().catch(function () { return {}; });
    if (!r.ok) {
      var msg = data && data.error && data.error.message;
      var code = r.status === 429 ? "rate_limited"
        : (r.status === 401 || r.status === 403) ? "invalid_key"
        : "upstream_error";
      return res.status(r.status === 429 ? 429 : 502).json({
        error: code,
        message: msg || ("Claude API returned " + r.status)
      });
    }
    var text = (data.content || [])
      .filter(function (b) { return b.type === "text"; })
      .map(function (b) { return b.text; })
      .join("");
    var tool = (data.content || []).filter(function (b) { return b.type === "tool_use"; })[0];
    return res.status(200).json(tool ? { text: text, data: tool.input } : { text: text });
  } catch (e) {
    return res.status(502).json({ error: "network_error", message: String(e && e.message || e) });
  }
};
