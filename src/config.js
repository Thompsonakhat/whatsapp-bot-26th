import "dotenv/config";

function envText(key, fallback) {
  const value = process.env[key];
  if (typeof value !== "string" || value.trim() === "") return fallback;
  return value.trim();
}

export const cfg = {
  port: Number(process.env.PORT || 3000),
  webhookSecret: process.env.CMB_WHATSAPP_WEBHOOK_SECRET || "",
  communityName: envText("COMMUNITY_NAME", "Our Community"),
  adminContact: envText("ADMIN_CONTACT", "Please contact a group admin."),
  communityRules: envText("COMMUNITY_RULES", "Be respectful, no spam, and follow admin guidance."),
  communityAnnouncements: envText("COMMUNITY_ANNOUNCEMENTS", "No new announcements right now."),
  communityAbout: envText("COMMUNITY_ABOUT", "This is a friendly community space for updates, support, and helpful conversations."),
};

export const BOT_PROFILE = {
  name: "Community Engagement Bot",
  platform: "whatsapp",
  description: "A CookMyBots managed WhatsApp community information assistant for greetings, menus, rules, announcements, admin contact, and community details.",
  commands: [
    "menu",
    "/menu",
    "start",
    "/start",
    "help",
    "/help",
    "settings",
    "/settings",
    "about",
    "/about",
    "cancel",
    "1",
    "2",
    "3",
    "4",
    "rules",
    "announcements",
    "contact admin",
  ],
  capabilities: [
    "Welcomes users with the community name and a numbered menu",
    "Shares community rules",
    "Shares current announcements",
    "Shares admin contact information",
    "Explains the community and how to use the bot",
    "Works in private chats and group chats routed by CookMyBots managed WhatsApp transport",
  ],
  limitations: [
    "The service is the WhatsApp bot brain only; CookMyBots manages the WhatsApp connection",
    "Admin contact information is informational only",
    "In groups, the bot avoids replying to unrelated messages to reduce noise",
  ],
};

export const BOT_PROFILE_TEXT = [
  "Purpose: Community information assistant for " + cfg.communityName + ".",
  "Public features: greetings, menu, help, settings, about, cancel, Rules, Announcements, Contact Admin, and About.",
  "Rules: Works in private chats and groups. In groups, respond only to greetings, menu keywords, recognized options, and direct community information requests. Admin contact is informational only.",
].join(" ");

export function envPresence() {
  return {
    portSet: Boolean(process.env.PORT),
    webhookSecretSet: Boolean(process.env.CMB_WHATSAPP_WEBHOOK_SECRET),
    communityNameSet: Boolean(process.env.COMMUNITY_NAME),
    adminContactSet: Boolean(process.env.ADMIN_CONTACT),
    communityRulesSet: Boolean(process.env.COMMUNITY_RULES),
    communityAnnouncementsSet: Boolean(process.env.COMMUNITY_ANNOUNCEMENTS),
    communityAboutSet: Boolean(process.env.COMMUNITY_ABOUT),
  };
}
