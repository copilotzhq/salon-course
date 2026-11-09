/**
 * The salon on the web, on Node: the app's plugins, and the page (Copilotz's
 * `webPage`, with the browser's code bundled as it starts). In memory: it
 * starts empty each time.
 *
 *   npm run dev          # http://127.0.0.1:8080/space/desk
 *
 * Staff sign in by name, from this machine only (`devSignIn`): Sam manages
 * the desk.
 */
import process from "node:process";
import { createRuntime, definePlugin } from "copilotz";
import { memoryStore } from "copilotz/stores/memory";
import { devSignIn } from "copilotz/plugins/access";
import { webPage } from "copilotz/web/server";
import { bundle, listen } from "copilotz/web/node";
import { DESK, openDesk, plugins } from "./app.ts";

const port = Number(process.env.PORT ?? 8080);
const runtime = await createRuntime({
  store: memoryStore(),
  plugins: [
    ...plugins({ openai: process.env.OPENAI_API_KEY }),
    devSignIn,
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
console.log(`The salon on ${server.url}space/${DESK}`);
process.once("SIGINT", async () => {
  await server.shutdown();
  await runtime.close({ drain: 8_000 });
  process.exit(0);
});
