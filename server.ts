/**
 * The salon on the web, on Node: the app's plugins, and the page (Copilotz's
 * `webPage`, with the browser's code bundled as it starts), and the widgets
 * assistants draw. In memory: it starts empty each time.
 *
 *   npm run dev          # http://127.0.0.1:8080/space/desk for staff, / for customers
 *
 * Staff sign in by name, from this machine only (`devSignIn`): Sam manages
 * the desk. Assistants post to /mcp/salon (ChatGPT needs it public: a
 * tunnel's https address, and `SALON_ORIGIN` set to it, without devSignIn).
 * With a WhatsApp number's settings (`WHATSAPP_*`), Meta posts its messages
 * to /hooks/whatsapp/salon.
 */
import process from "node:process";
import { randomBytes } from "node:crypto";
import { createRuntime, definePlugin } from "copilotz";
import { memoryStore } from "copilotz/stores/memory";
import { devSignIn } from "copilotz/plugins/access";
import { webPage, widgetsOf } from "copilotz/web/server";
import { bundle, listen } from "copilotz/web/node";
import { DESK, openDesk, plugins } from "./app.ts";
import { bookingsWidget } from "./plugins/bookings/web.tsx";

const port = Number(process.env.PORT ?? 8080);
const origin = process.env.SALON_ORIGIN ?? `http://127.0.0.1:${port}`;
// What MCP's ids are sealed with: 32 bytes or more. A new one each start, unless set.
const secret = process.env.SALON_SECRET || randomBytes(32).toString("hex");
const local = new URL(origin).hostname === "127.0.0.1";
const env = process.env;
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

const runtime = await createRuntime({
  store: memoryStore(),
  plugins: [
    ...plugins({
      openai: process.env.OPENAI_API_KEY,
      links: { origin, secret },
      ...(number ? { whatsapp: number } : {}),
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
        page: { title: "The salon", code: () => bundle(new URL("./browser.tsx", import.meta.url)) },
      },
    }),
  ],
});
await openDesk(runtime);

const server = await listen(runtime.fetch, { hostname: "127.0.0.1", port });
console.log(
  `The salon's site on ${server.url}, the desk at /space/${DESK}, MCP at ${origin}/mcp/salon`,
);
process.once("SIGINT", async () => {
  await server.shutdown();
  await runtime.close({ drain: 8_000 });
  process.exit(0);
});
