export function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

export function clampText(value, max = 4000) {
  return String(value || "").slice(0, max);
}

function write(level, message, meta = {}) {
  const payload = {
    level,
    message,
    at: new Date().toISOString(),
    ...meta,
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}

export const logger = {
  info(message, meta = {}) {
    write("info", message, meta);
  },
  warn(message, meta = {}) {
    write("warn", message, meta);
  },
  error(message, meta = {}) {
    write("error", message, meta);
  },
};
