function hasAi(cfg) {
  return Boolean(cfg.COOKMYBOTS_AI_ENDPOINT && cfg.COOKMYBOTS_AI_KEY);
}

async function callGateway(cfg, messages) {
  const base = String(cfg.COOKMYBOTS_AI_ENDPOINT || "").replace(/\/+$/, "");
  const url = base + "/chat";

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + cfg.COOKMYBOTS_AI_KEY,
    },
    body: JSON.stringify({
      messages,
      meta: {
        platform: "whatsapp",
        web3Mode: cfg.WEB3_CHAT_MODE || "auto",
      },
    }),
  });

  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error("AI gateway error: " + r.status + " " + body);
  }

  const j = await r.json();
  return String(j?.output?.content || j?.text || j?.reply || "").trim();
}

export async function aiSmartChat({ systemPrompt, userText, history }) {
  const { cfg } = await import("./config.js");

  if (!hasAi(cfg)) {
    return [
      "I received your message.",
      "",
      "Type menu to see what I can do, or configure CookMyBots AI Gateway for full AI replies.",
    ].join("\n");
  }

  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: String(systemPrompt) });

  for (const turn of history || []) {
    if (!turn?.role || !turn?.text) continue;
    messages.push({ role: turn.role, content: String(turn.text) });
  }

  messages.push({ role: "user", content: String(userText) });

  try {
    return await callGateway(cfg, messages);
  } catch (err) {
    console.warn("AI call failed:", err?.message || err);

    return [
      "I had trouble reaching the AI service.",
      "",
      "Type menu to use the built-in bot commands.",
    ].join("\n");
  }
}
