# WhatsApp Community Assistant Bot

This is a CookMyBots managed WhatsApp bot.

## Important

This project is the bot brain only. CookMyBots owns the WhatsApp connection/session and forwards inbound WhatsApp messages to this deployed app.

## Supported commands

- menu
- help
- settings
- about
- start
- rules
- announcement
- contact admin
- cancel

Slash-style inputs are also supported:

- /menu
- /help
- /settings
- /about
- /start

## Transport endpoint

CookMyBots calls:

```txt
POST /webhook/cookmybots/whatsapp
```

The endpoint returns:

```json
{ "ok": true, "reply": "..." }
```

## Local test

```bash
npm install
cp .env.sample .env
npm run dev
```

Then:

```bash
curl -X POST http://localhost:3000/test \
  -H "Content-Type: application/json" \
  -d '{"text":"/menu"}'
```
