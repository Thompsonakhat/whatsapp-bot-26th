import express from "express";
import { cfg, BOT_PROFILE, BOT_PROFILE_TEXT } from "./config.js";
import { clampText, logger, safeErr } from "./lib/logger.js";

const GREETINGS = new Set([
  "hi",
  "hii",
  "hiii",
  "hello",
  "helo",
  "hey",
  "heyy",
  "gm",
  "good morning",
  "good afternoon",
  "good evening",
  "morning",
  "afternoon",
  "evening",
  "start",
  "menu",
  "main menu",
  "help",
]);

const RULES = new Set([
  "1",
  "rules",
  "rule",
  "community rules",
]);

const ANNOUNCEMENTS = new Set([
  "2",
  "announcements",
  "announcement",
  "news",
  "updates",
  "update",
]);

const CONTACT_ADMIN = new Set([
  "3",
  "contact",
  "admin",
  "admins",
  "contact admin",
  "help admin",
  "support",
]);

const ABOUT = new Set([
  "4",
  "about",
  "info",
  "community",
  "who are you",
  "what can you do",
  "how can i use this bot",
  "how do i use this bot",
]);

const SETTINGS = new Set([
  "settings",
  "setting",
  "5",
]);

const CANCEL = new Set([
  "cancel",
  "stop",
  "back",
  "exit",
  "6",
]);

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^[\/!#.]+/, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, "\"")
    .replace(/[!?.,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isSimpleGreeting(text) {
  if (GREETINGS.has(text)) return true;
  return /^(hi+|he+y+|hello+|good\s+(morning|afternoon|evening))\b/.test(text);
}

function welcomeMenu(event = {}) {
  const chatType = event.isGroup ? "group" : "private chat";

  return [
    "Welcome to " + cfg.communityName + ".",
    "I can help with quick community information in this " + chatType + ".",
    "",
    "Reply with a number:",
    "1. Rules",
    "2. Announcements",
    "3. Contact Admin",
    "4. About",
    "",
    "You can type menu anytime.",
  ].join("\n");
}

function rulesReply() {
  return [
    "Community Rules",
    cfg.communityRules,
    "",
    "Type menu to see the options again.",
  ].join("\n");
}

function announcementsReply() {
  return [
    "Announcements",
    cfg.communityAnnouncements,
    "",
    "Type menu to see the options again.",
  ].join("\n");
}

function contactAdminReply() {
  return [
    "Contact Admin",
    cfg.adminContact,
    "",
    "This is informational only. Please follow your community's admin guidance.",
  ].join("\n");
}

function aboutReply(event = {}) {
  const groupNote = event.isGroup
    ? "I can respond in groups when CookMyBots receives group messages from the connected WhatsApp session."
    : "I also work in groups when CookMyBots routes group messages from the connected WhatsApp session.";

  return [
    "About " + cfg.communityName,
    cfg.communityAbout,
    "",
    groupNote,
    "",
    "Type menu to see what I can show you.",
  ].join("\n");
}

function settingsReply(event = {}) {
  return [
    "Settings",
    "Community: " + cfg.communityName,
    "Chat type: " + (event.isGroup ? "Group" : "Private"),
    "Managed WhatsApp transport: CookMyBots",
    "",
    "Community text is configured with environment variables.",
  ].join("\n");
}

function invalidPrivateReply() {
  return "I did not catch that. Type menu to see Rules, Announcements, Contact Admin, and About.";
}

function invalidNavigationReply() {
  return [
    "Please choose a valid option:",
    "1. Rules",
    "2. Announcements",
    "3. Contact Admin",
    "4. About",
    "",
    "Or type menu to start again.",
  ].join("\n");
}

function routeMessage(event = {}) {
  const normalized = normalizeText(event.text);

  if (!normalized) {
    return event.isGroup ? "" : invalidPrivateReply();
  }

  if (isSimpleGreeting(normalized)) return welcomeMenu(event);
  if (RULES.has(normalized)) return rulesReply();
  if (ANNOUNCEMENTS.has(normalized)) return announcementsReply();
  if (CONTACT_ADMIN.has(normalized)) return contactAdminReply();
  if (ABOUT.has(normalized)) return aboutReply(event);
  if (SETTINGS.has(normalized)) return settingsReply(event);

  if (CANCEL.has(normalized)) {
    return "Cancelled. Type menu whenever you need community information.";
  }

  if (["0", "7", "8", "9"].includes(normalized)) {
    return event.isGroup ? "" : invalidNavigationReply();
  }

  if (event.isGroup) return "";

  if (normalized.length <= 40) return invalidPrivateReply();

  return "I mainly help with community information. Type menu to see the options.";
}

function normalizeInbound(body = {}) {
  const from = String(body.from || body.chatId || "anon").trim();
  const chatId = String(body.chatId || body.from || from || "anon").trim();
  const senderId = String(body.senderId || body.participantJid || body.participant || body.from || from || "anon").trim();

  return {
    projectId: String(body.projectId || "").trim(),
    platform: "whatsapp",
    source: String(body.source || "managed").trim(),
    from,
    chatId,
    senderId,
    participantJid: String(body.participantJid || body.participant || "").trim(),
    text: String(body.text || "").trim(),
    messageId: String(body.messageId || "").trim(),
    isGroup: Boolean(body.isGroup || String(chatId).endsWith("@g.us")),
    groupId: body.groupId ? String(body.groupId) : String(chatId).endsWith("@g.us") ? chatId : null,
    pushName: body.pushName ? String(body.pushName) : "",
    messageType: body.messageType ? String(body.messageType) : "text",
    timestamp: Number(body.timestamp || Date.now()),
    raw: body.raw || body,
  };
}

function verifyWebhook(req) {
  const expected = String(cfg.webhookSecret || "").trim();
  const got = String(req.headers["x-cookmybots-webhook-secret"] || "").trim();

  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "webhook_secret_not_configured",
    };
  }

  if (got !== expected) {
    return {
      ok: false,
      status: 401,
      error: "unauthorized",
    };
  }

  return { ok: true };
}

export function handleWhatsAppMessage(event = {}) {
  logger.info("message_handling_begin", {
    platform: "whatsapp",
    isGroup: Boolean(event.isGroup),
    messageType: event.messageType || "text",
    textPresent: Boolean(event.text),
  });

  const reply = routeMessage(event);

  logger.info("message_handling_complete", {
    platform: "whatsapp",
    isGroup: Boolean(event.isGroup),
    replied: Boolean(reply),
  });

  return clampText(reply || "", 4000);
}

export function createServer() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.get("/", (_req, res) => {
    res.status(200).send("OK");
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({
      ok: true,
      platform: "whatsapp",
      managedTransport: true,
      profile: BOT_PROFILE.name,
    });
  });

  app.get("/profile", (_req, res) => {
    res.status(200).json({
      ok: true,
      profile: BOT_PROFILE,
      profileText: BOT_PROFILE_TEXT,
    });
  });

  app.post("/webhook/cookmybots/whatsapp", async (req, res) => {
    try {
      const auth = verifyWebhook(req);
      if (!auth.ok) {
        logger.warn("webhook_rejected", {
          reason: auth.error,
          secretConfigured: Boolean(cfg.webhookSecret),
        });
        return res.status(auth.status).json({ ok: false, error: auth.error });
      }

      const event = normalizeInbound(req.body || {});
      const reply = handleWhatsAppMessage(event);

      return res.json({
        ok: true,
        reply,
      });
    } catch (err) {
      logger.error("message_handling_failed", {
        platform: "whatsapp",
        error: safeErr(err),
      });

      return res.status(500).json({
        ok: false,
        error: "server_error",
        reply: "Sorry, something went wrong. Please try menu again.",
      });
    }
  });

  app.post("/test", async (req, res) => {
    try {
      const event = normalizeInbound({
        ...req.body,
        from: req.body?.from || "local@s.whatsapp.net",
        chatId: req.body?.chatId || "local@s.whatsapp.net",
        senderId: req.body?.senderId || "local@s.whatsapp.net",
        source: "local_test",
      });
      const reply = handleWhatsAppMessage(event);
      return res.json({ ok: true, reply });
    } catch (err) {
      logger.error("local_test_failed", { error: safeErr(err) });
      return res.status(500).json({ ok: false, error: "server_error" });
    }
  });

  return app;
}
