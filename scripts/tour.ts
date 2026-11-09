/**
 * Every way in, one after another, in memory: staff at the desk, the
 * salon's own concierge in a customer's chat, an assistant over MCP, a
 * visitor on the site, a customer on WhatsApp (Meta's API played by a fake). Then
 * what the desk sees, and the record. With `OPENAI_API_KEY`, the concierge
 * thinks with OpenAI; without it, with the offline fake model, which echoes.
 *
 *   npm run tour
 */
import process from "node:process";
import { createRuntime } from "copilotz";
import type { Message } from "copilotz/plugins/agents";
import { memoryStore } from "copilotz/stores/memory";
import { openDesk, plugins } from "../app.ts";
import { bookedBy, customer, LINKS, sam, seen } from "../tests/kit.ts";
import { assistant, graph, NUMBER, visitor, whatsapp } from "../tests/ways.ts";

const meta = graph();
const store = memoryStore();
const runtime = await createRuntime({
  store,
  // Meta's Graph API is the fake; everything else (OpenAI) is the real one.
  fetch: (input, init) =>
    String(input instanceof Request ? input.url : input).startsWith("https://graph.facebook.com/")
      ? meta.fetch(input, init)
      : fetch(input, init),
  plugins: plugins({ openai: process.env.OPENAI_API_KEY, links: LINKS, whatsapp: NUMBER }),
});
await openDesk(runtime);

/** What the concierge said last in a chat, as the desk reads it. */
const said = async (thread: string) =>
  (await runtime.query<Message[]>("message.history", { thread }, { actor: sam })).at(-1)?.text;

// The web page: Sam books a walk-in at the desk.
await runtime.call("booking.make", { slot: "tue-10", name: "Rui" }, { actor: sam });
console.log("desk      › booked Tue 10:00 for Rui");

// The salon's own agent, in Bia's chat.
const bia = await customer(runtime, "Bia");
await runtime.call("chat.send", {
  thread: bia.thread,
  text: "Hi! Is there anything Tuesday late morning? If so, book it for me.",
}, { actor: bia.actor });
await runtime.idle();
console.log(`bia       › ${await said(bia.thread)}`);

// An assistant over MCP: what its model reads back.
const chatgpt = assistant(runtime, "conversation-1");
const booked = await chatgpt.call("book", { slot: "wed-15" });
console.log(`assistant › ${booked.text?.split("\n")[0]}`);

// A visitor on the site.
const site = await visitor(runtime, "198.51.100.7");
const { thread } = await site.call<{ thread: string }>("chat.send", {
  text: "Hello, is Friday afternoon free? Please book it.",
});
await runtime.idle();
console.log(`site      › ${await said(thread)}`);
await site.close();

// A customer on WhatsApp.
await whatsapp(runtime, { phone: "5511988887777", name: "Dora" }, "Saturday at 10, please.");
console.log(`whatsapp  › ${meta.texts("5511988887777").at(-1)}`);

console.log(`\nThe desk sees:\n${await seen(runtime, "bookings", sam)}`);
console.log("\nThe record:");
for (const [slot, by] of Object.entries(await bookedBy(store))) console.log(`  ${slot}  ${by}`);
await runtime.close();
