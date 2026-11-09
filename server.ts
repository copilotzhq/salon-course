/**
 * The salon on the web, on Node, kept: the app's plugins, the page
 * (Copilotz's `webPage`, with the browser's code bundled as it starts), and
 * the widgets assistants draw, in SQLite or PostgreSQL (store.ts).
 *
 *   npm run dev          # http://127.0.0.1:8080/space/desk for staff, / for customers
 *
 * On this machine, staff sign in by name (`devSignIn`). Online, at a public
 * `SALON_ORIGIN`, devSignIn is out: Sam is invited by email
 * (`SALON_STAFF`, sent with Resend), and listens to every address, behind
 * the platform's proxy. `SALON_SECRET` keeps MCP's and the site's ids the
 * same from one start to the next. With a WhatsApp number's settings
 * (`WHATSAPP_*`), Meta posts its messages to /hooks/whatsapp/salon.
 */
import process from "node:process";
import { randomBytes } from "node:crypto";
import { createRuntime, definePlugin } from "copilotz";
import { devSignIn } from "copilotz/plugins/access";
import { webPage, widgetsOf } from "copilotz/web/server";
import { bundle, serve } from "copilotz/web/node";
import { DESK, openDesk, plugins } from "./app.ts";
import { bookingsWidget } from "./plugins/bookings/web.tsx";
import { openStorage } from "./store.ts";

const env = process.env;
const port = Number(env.PORT ?? 8080);
const origin = env.SALON_ORIGIN ?? `http://127.0.0.1:${port}`;
const local = new URL(origin).hostname === "127.0.0.1";
// What MCP's and the site's ids are sealed with (32 bytes or more). Kept, a conversation stays
// itself from one start to the next; new each start, every assistant's and visitor's starts over.
const secret = env.SALON_SECRET || randomBytes(32).toString("hex");
if (!env.SALON_SECRET) console.warn("No SALON_SECRET: assistants' and visitors' chats start over.");
// A WhatsApp number, when all four of Meta's settings are there.
const number =
  env.WHATSAPP_PHONE_ID && env.WHATSAPP_TOKEN && env.WHATSAPP_SECRET && env.WHATSAPP_VERIFY
    ? {
      phoneId: env.WHATSAPP_PHONE_ID,
      token: env.WHATSAPP_TOKEN,
      secret: env.WHATSAPP_SECRET,
      verify: env.WHATSAPP_VERIFY,
    }
    : undefined;
// Online, staff sign in by email: Sam's address, and Resend's key and sender.
const staff = !local && env.SALON_STAFF && env.RESEND_API_KEY && env.SALON_FROM
  ? { email: env.SALON_STAFF, apiKey: env.RESEND_API_KEY, from: env.SALON_FROM }
  : undefined;

const storage = await openStorage(env);
const stopping = new AbortController();
process.once("SIGINT", () => stopping.abort());
process.once("SIGTERM", () => stopping.abort());

// It listens first, takes the store's lease (PostgreSQL's), then opens the salon.
const { server } = await serve(async () => {
  const runtime = await createRuntime({
    store: storage.store,
    plugins: [
      ...plugins({
        openai: env.OPENAI_API_KEY,
        links: { origin, secret },
        ...(number ? { whatsapp: number } : {}),
        ...(staff ? { email: { apiKey: staff.apiKey, from: staff.from } } : {}),
        // Behind the platform's proxy, a caller is the address it appended last.
        ...(local
          ? {}
          : { caller: { header: "x-forwarded-for", hops: Number(env.SALON_HOPS ?? 1) } }),
        // What an assistant draws under a tool's answer: the same View as the web's.
        widgets: widgetsOf({
          code: () => bundle(new URL("./widget.tsx", import.meta.url), { split: false }),
          plugins: [bookingsWidget],
        }),
      }),
      ...(local ? [devSignIn] : []),
      webPage,
      definePlugin({
        name: "page",
        resources: {
          page: {
            title: "The salon",
            code: () => bundle(new URL("./browser.tsx", import.meta.url)),
          },
        },
      }),
    ],
  });
  await openDesk(runtime, staff);
  return runtime;
}, {
  hostname: local ? "127.0.0.1" : "0.0.0.0",
  port,
  signal: stopping.signal,
  ...(storage.hold ? { hold: storage.hold } : {}),
  stopped: (code) => void storage.close().finally(() => process.exit(code)),
});
console.log(
  `The salon's site on ${server.url}, the desk at /space/${DESK}, MCP at ${origin}/mcp/salon`,
);
