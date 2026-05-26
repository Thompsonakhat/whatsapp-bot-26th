import { cfg } from "./config.js";
import { normalizeText } from "./normalize.js";
import {
  aboutMenu,
  announcementsMenu,
  contactAdminMenu,
  helpMenu,
  mainMenu,
  rulesMenu,
  settingsMenu,
} from "./menu.js";
import { clearState, getState } from "./sessionState.js";

const aliases = new Map([
  ["menu", ["0", "menu", "main menu", "start", "hi", "hello", "hey", "good morning", "good afternoon", "good evening"]],
  ["help", ["1", "help", "commands", "command", "what can you do", "how can i use this bot", "how can i make use of this bot", "how does this work"]],
  ["settings", ["2", "settings", "setting", "config", "configuration", "setup"]],
  ["about", ["3", "about", "info", "who are you", "what are you", "bot info"]],
  ["rules", ["4", "rules", "rule", "community rules"]],
  ["announcements", ["5", "announcement", "announcements", "news", "updates"]],
  ["contact_admin", ["6", "contact admin", "admin", "admins", "contact admins", "support", "moderator"]],
  ["cancel", ["cancel", "stop", "exit", "back"]],
]);

function detectCommand(text) {
  const n = normalizeText(text);

  for (const [cmd, list] of aliases.entries()) {
    if (list.includes(n)) return cmd;
  }

  return null;
}

export async function routeMessage(event = {}) {
  const text = String(event.text || "").trim();
  const normalized = normalizeText(text);

  if (!normalized) {
    return { handled: true, reply: "Please send a message, or type menu to see options." };
  }

  const command = detectCommand(text);

  if (command === "cancel") {
    await clearState({
      mongoUri: cfg.MONGODB_URI,
      chatId: event.chatId,
      userId: event.userId,
    });

    return { handled: true, reply: "Cancelled. Type menu to start again." };
  }

  const state = await getState({
    mongoUri: cfg.MONGODB_URI,
    chatId: event.chatId,
    userId: event.userId,
  });

  if (state?.flow) {
    return {
      handled: true,
      reply:
        "You were in the middle of: " +
        String(state.flow) +
        ".\n\nType cancel to exit, or menu to open the main menu.",
    };
  }

  if (command === "menu") return { handled: true, reply: mainMenu(event) };
  if (command === "help") return { handled: true, reply: helpMenu(event) };
  if (command === "settings") return { handled: true, reply: settingsMenu(event) };
  if (command === "about") return { handled: true, reply: aboutMenu(event) };
  if (command === "rules") return { handled: true, reply: rulesMenu(event) };
  if (command === "announcements") return { handled: true, reply: announcementsMenu(event) };
  if (command === "contact_admin") return { handled: true, reply: contactAdminMenu(event) };

  return { handled: false };
}
