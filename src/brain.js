import { cfg } from "./lib/config.js";
import { addTurn, getRecentTurns } from "./lib/memory.js";
import { aiSmartChat } from "./lib/ai.js";
import { BOT_PROMPT } from "./lib/botProfile.js";
import { routeMessage } from "./lib/router.js";

export async function handleText(event) {
  const uid = String(event.userId || event.senderId || event.from || "anon");
  const cid = String(event.chatId || event.from || uid);
  const text = String(event.text || "").trim();

  await addTurn({
    mongoUri: cfg.MONGODB_URI,
    platform: "whatsapp",
    userId: uid,
    chatId: cid,
    role: "user",
    text,
    meta: {
      isGroup: Boolean(event.isGroup),
      groupId: event.groupId || null,
      messageId: event.messageId || "",
      source: event.source || "session",
    },
  });

  const routed = await routeMessage({
    ...event,
    userId: uid,
    chatId: cid,
    text,
  });

  if (routed?.handled) {
    const out = String(routed.reply || "Done.").trim();

    await addTurn({
      mongoUri: cfg.MONGODB_URI,
      platform: "whatsapp",
      userId: uid,
      chatId: cid,
      role: "assistant",
      text: out,
    });

    return out;
  }

  const history = await getRecentTurns({
    mongoUri: cfg.MONGODB_URI,
    platform: "whatsapp",
    userId: uid,
    chatId: cid,
    limit: 12,
  });

  const contextPrompt = [
    BOT_PROMPT,
    "",
    "Current WhatsApp context:",
    "- chatId: " + cid,
    "- senderId: " + uid,
    "- isGroup: " + Boolean(event.isGroup),
    "- groupId: " + String(event.groupId || "none"),
    "",
    "Important:",
    "- If asked how to use the bot, explain this bot's WhatsApp commands and capabilities.",
    "- If asked about groups, explain CookMyBots routes group messages when the connected WhatsApp session receives them.",
    "- Do not give generic instructions about adding ChatGPT/API bots to Telegram, Slack, Teams, or Discord.",
  ].join("\n");

  const reply = await aiSmartChat({
    systemPrompt: contextPrompt,
    userText: text,
    history,
    platform: "whatsapp",
    userId: uid,
    chatId: cid,
  });

  const out = String(reply || "").trim() || "Got it.";

  await addTurn({
    mongoUri: cfg.MONGODB_URI,
    platform: "whatsapp",
    userId: uid,
    chatId: cid,
    role: "assistant",
    text: out,
  });

  return out;
}
