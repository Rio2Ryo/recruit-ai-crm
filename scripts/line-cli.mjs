#!/usr/bin/env node
import process from "node:process";

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function usage() {
  console.log(`Recruit AI LINE CLI

Usage:
  npm run line:send -- --to <LINE_USER_ID> --text "message"
  npm run line:broadcast -- --text "message"
  npm run line:quota
  npm run line:profile -- --user <LINE_USER_ID>
  npm run line:apply-url -- --user <LINE_USER_ID>

Env:
  LINE_CHANNEL_ACCESS_TOKEN   required for LINE API calls
  NEXT_PUBLIC_APP_URL         used for LIFF/apply URL generation
`);
}

function args() {
  const out = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i += 1) {
    if (raw[i].startsWith("--")) {
      out[raw[i].slice(2)] = raw[i + 1] && !raw[i + 1].startsWith("--") ? raw[++i] : true;
    } else if (!out._) {
      out._ = raw[i];
    }
  }
  return out;
}

async function lineFetch(path, options = {}) {
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required");
  const response = await fetch(`https://api.line.me${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${text}`);
  try {
    return JSON.parse(text || "{}");
  } catch {
    return { ok: true, text };
  }
}

const opts = args();
const command = opts._;

try {
  if (!command || opts.help) {
    usage();
    process.exit(0);
  }

  if (command === "send") {
    if (!opts.to || !opts.text) throw new Error("--to and --text are required");
    const result = await lineFetch("/v2/bot/message/push", {
      method: "POST",
      body: JSON.stringify({ to: opts.to, messages: [{ type: "text", text: opts.text }] }),
    });
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "broadcast") {
    if (!opts.text) throw new Error("--text is required");
    const result = await lineFetch("/v2/bot/message/broadcast", {
      method: "POST",
      body: JSON.stringify({ messages: [{ type: "text", text: opts.text }] }),
    });
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "quota") {
    const [limit, consumption] = await Promise.all([
      lineFetch("/v2/bot/message/quota"),
      lineFetch("/v2/bot/message/quota/consumption"),
    ]);
    console.log(JSON.stringify({ limit, consumption }, null, 2));
  } else if (command === "profile") {
    const user = opts.user || opts.to;
    if (!user) throw new Error("--user is required");
    console.log(JSON.stringify(await lineFetch(`/v2/bot/profile/${user}`), null, 2));
  } else if (command === "apply-url") {
    const url = new URL("/line/apply", baseUrl);
    if (opts.user) url.searchParams.set("lineUserId", opts.user);
    console.log(url.toString());
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
