import { BOT_PROFILE } from "./botProfile.js";

function list(items) {
  return items.map((item, index) => String(index + 1) + ") " + item).join("\n");
}

export function mainMenu(event = {}) {
  return [
    BOT_PROFILE.name,
    "",
    "I am active in this " + (event.isGroup ? "group chat" : "private chat") + ".",
    "",
    "Choose an option:",
    "",
    list([
      "Help",
      "Settings",
      "About",
      "Rules",
      "Announcements",
      "Contact Admin",
    ]),
    "",
    "You can reply with a number, or type commands like /help, /settings, /about, rules, or contact admin.",
  ].join("\n");
}

export function helpMenu(event = {}) {
  return [
    "Help",
    "",
    "You can use these commands:",
    BOT_PROFILE.commands.map((cmd) => "- " + cmd).join("\n"),
    "",
    "Slash-style commands also work:",
    "- /menu",
    "- /help",
    "- /settings",
    "- /about",
    "",
    event.isGroup
      ? "This is a group chat. Advanced group admin tools are coming soon."
      : "This is a private chat. Type menu anytime to return to the main menu.",
  ].join("\n");
}

export function settingsMenu(event = {}) {
  return [
    "Settings",
    "",
    "Platform: WhatsApp",
    "Chat type: " + (event.isGroup ? "Group" : "Private"),
    "Chat ID: " + String(event.chatId || "unknown"),
    "",
    "Enabled:",
    "- Plain-text commands",
    "- Slash-style command aliases",
    "- Numbered menu replies",
    "- Bot self-knowledge",
    "- AI fallback",
    "",
    "Coming soon:",
    "- Advanced group admin checks",
    "- Proactive alert sending",
    "- Per-group settings",
  ].join("\n");
}

export function aboutMenu(event = {}) {
  return [
    "About",
    "",
    BOT_PROFILE.description,
    "",
    "What I can do:",
    BOT_PROFILE.capabilities.map((item) => "- " + item).join("\n"),
    "",
    "Limits:",
    BOT_PROFILE.limitations.map((item) => "- " + item).join("\n"),
    "",
    event.isGroup
      ? "Group note: I can respond here because CookMyBots routed this WhatsApp group message to my bot brain."
      : "Private chat note: you can use me here directly. Group replies work when CookMyBots routes group messages from the connected session.",
  ].join("\n");
}

export function rulesMenu() {
  return [
    "Community Rules",
    "",
    "1) Be respectful.",
    "2) Do not spam.",
    "3) Stay on topic.",
    "4) Protect your privacy and other people's privacy.",
    "5) Contact admins if you notice an issue.",
    "",
    "Type menu to return to the main menu.",
  ].join("\n");
}

export function announcementsMenu() {
  return [
    "Announcements",
    "",
    "No announcements have been configured yet.",
    "",
    "In a future version, admins will be able to set announcements directly from WhatsApp.",
    "",
    "Type menu to return to the main menu.",
  ].join("\n");
}

export function contactAdminMenu(event = {}) {
  return [
    "Contact Admin",
    "",
    event.isGroup
      ? "Send a clear message in the group and tag an admin, or message an admin directly if the group has a preferred contact method."
      : "Send a clear message explaining what you need. If this relates to a group, include the group name.",
    "",
    "Type menu to return to the main menu.",
  ].join("\n");
}
