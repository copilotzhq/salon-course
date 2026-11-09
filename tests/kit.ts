/**
 * The salon's test kit: the app as app.ts makes it, in memory. Sam is
 * staff: a person, the manager of the desk. Customers are contacts, each
 * with a chat of their own at the desk.
 *
 * ```ts
 * const { runtime } = await salon();
 * const bia = await customer(runtime, "Bia");
 * ```
 */
import { type Actor, createRuntime, type Runtime } from "copilotz";
import { memoryStore } from "copilotz/stores/memory";
import { DESK, openDesk, plugins } from "../app.ts";

/** Staff: a person, at the desk. His calls are there (`in`), as a page of the desk says. */
export const sam: Actor = { kind: "person", id: "sam", in: DESK };

/** The salon, in memory: Sam, and the desk he manages. */
export async function salon() {
  const store = memoryStore();
  const runtime = await createRuntime({ store, plugins: plugins() });
  await openDesk(runtime);
  return { runtime, store };
}

/** A customer: a contact with a chat of its own at the desk. */
export async function customer(runtime: Runtime, name: string) {
  const { contact } = await runtime.call<{ contact: string }>("contact.start", {
    in: DESK,
    via: "test",
    name,
  });
  const { thread } = await runtime.call<{ thread: string }>("contact.chat", { contact, in: DESK });
  return { actor: { kind: "contact", id: contact } as Actor, thread };
}

/** A text View's output, as `actor` sees it now. */
export async function seen(runtime: Runtime, view: string, actor: Actor): Promise<string> {
  const observed = runtime.observe<string>(view, {}, { actor });
  try {
    const output = await observed.ready;
    if (output.status !== "ready") throw new Error(`${view}: ${JSON.stringify(output)}`);
    return output.value;
  } finally {
    observed.close();
  }
}
