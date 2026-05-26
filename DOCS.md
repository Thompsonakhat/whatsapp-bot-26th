# WhatsApp Community Engagement Bot

This is a CookMyBots managed WhatsApp bot brain for community engagement. CookMyBots manages the WhatsApp session and forwards messages to this service.

The bot welcomes users, shows a short menu, and provides quick access to community rules, announcements, admin contact information, and about/community information.

## Public commands and menu options

| Input | What it does | Parameters |
| --- | --- | --- |
| `hi`, `hello`, `hey`, `good morning`, `good afternoon`, `good evening` | Shows the welcome message and menu | None |
| `menu`, `/menu`, `start`, `/start`, `help`, `/help` | Shows the main menu | None |
| `1`, `rules`, `rule` | Shows community rules | None |
| `2`, `announcements`, `announcement`, `news`, `updates` | Shows announcements | None |
| `3`, `contact`, `admin`, `contact admin`, `help admin` | Shows admin contact instructions | None |
| `4`, `about`, `/about`, `info`, `community` | Shows community information | None |
| `settings`, `/settings` | Shows basic bot and chat settings | None |
| `cancel` | Cancels navigation and suggests using menu again | None |

## Group and private behavior

In private chats, unrecognized short messages get a polite suggestion to type `menu`.

In group chats, the bot avoids being noisy. It responds to greetings, menu keywords, and recognized menu options. It stays silent for unrelated group messages.

## Environment variables

`CMB_WHATSAPP_WEBHOOK_SECRET` verifies inbound CookMyBots webhook requests. Set this to the secret configured by CookMyBots.

`COMMUNITY_NAME` customizes the community name. Fallback: `Our Community`.

`ADMIN_CONTACT` customizes admin contact instructions. Fallback: `Please contact a group admin.`

`COMMUNITY_RULES` customizes community rules. Fallback: `Be respectful, no spam, and follow admin guidance.`

`COMMUNITY_ANNOUNCEMENTS` customizes announcements. Fallback: `No new announcements right now.`

`COMMUNITY_ABOUT` customizes the about/community text. Fallback: a friendly generic community description.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.sample` to `.env` for local development.
3. Set `CMB_WHATSAPP_WEBHOOK_SECRET`.
4. Customize the optional community text variables if needed.
5. Run locally with `npm run dev`.
6. Start in production with `npm start`.

## Webhook endpoint

CookMyBots calls:

`POST /webhook/cookmybots/whatsapp`

The endpoint returns:

`{ "ok": true, "reply": "..." }`

## Local test endpoint

For local testing only, you can call:

`POST /test`

Example body:

`{ "text": "menu", "isGroup": false }`

## Notes

This service does not implement WhatsApp Cloud API, Baileys, QR pairing, or phone pairing. CookMyBots managed WhatsApp transport handles the WhatsApp connection.

This cold-start version does not use AI, OpenAI, CookMyBots AI Gateway, MongoDB, or any other database.
