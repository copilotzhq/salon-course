/**
 * Every way in, one after another, in memory: staff at the desk, the
 * salon's own concierge in a customer's chat, an assistant over MCP. Then
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
import { assistant } from "../tests/ways.ts";

const store = memoryStore();
const runtime = await createRuntime({
  store,
  plugins: plugins({ openai: process.env.OPENAI_API_KEY, links: LINKS }),
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

console.log(`\nThe desk sees:\n${await seen(runtime, "bookings", sam)}`);
console.log("\nThe record:");
for (const [slot, by] of Object.entries(await bookedBy(store))) console.log(`  ${slot}  ${by}`);
await runtime.close();
