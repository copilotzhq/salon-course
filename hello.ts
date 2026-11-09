/**
 * One booking: the salon in memory, Sam books Tuesday at 10, tries again,
 * and reads the bookings. Then the record: every event, with who caused it.
 *
 *   npm run hello
 */
import { type Actor, createRuntime } from "copilotz";
import { memoryStore } from "copilotz/stores/memory";
import { plugins } from "./app.ts";

const store = memoryStore();
const runtime = await createRuntime({ store, plugins: plugins() });

// Every call is someone's. Sam works at the salon: a person.
const sam: Actor = { kind: "person", id: "sam" };
await runtime.call("booking.make", { slot: "tue-10" }, { actor: sam });
await runtime.call("booking.make", { slot: "tue-10" }, { actor: sam })
  .catch((error) => console.log(`Refused: ${error.message}`));
console.log(await runtime.render("bookings", {}));

console.log("\nThe record:");
for (const { seq, type, actor, data } of await store.events(0)) {
  const what = (data.doc as { label?: string } | undefined)?.label ?? data.action;
  console.log(`#${seq} ${type.padEnd(17)} ${String(what).padEnd(13)} ${actor?.kind} ${actor?.id}`);
}
await runtime.close();
