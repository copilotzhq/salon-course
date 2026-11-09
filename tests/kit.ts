/**
 * The salon's test kit: the app as app.ts makes it, in memory, with fakes
 * only at its edges. The concierge thinks with a scripted model that plays
 * a list of moves, one per call: something it says, or a tool it calls.
 * Sam is staff: a person, the manager of the desk. Customers are contacts,
 * each with a chat of their own at the desk.
 *
 * ```ts
 * const { runtime, concierge } = await salon({ moves: [{ tool: "list_slots" }, "Wed is free."] });
 * const bia = await customer(runtime, "Bia");
 * ```
 */
import {
  type Actor,
  createRuntime,
  definePlugin,
  type Plugin,
  type Runtime,
  type Store,
} from "copilotz";
import type { LlmAdapter, LlmRequest } from "copilotz/plugins/models";
import { memoryStore } from "copilotz/stores/memory";
import { widgetsOf } from "copilotz/web/server";
import { bundle } from "copilotz/web/node";
import { DESK, openDesk, plugins, type Settings } from "../app.ts";
import { bookingsWidget } from "../plugins/bookings/web.tsx";

/** Where the app is, and its secret (32 bytes or more). */
export const LINKS = {
  origin: "https://salon.example",
  secret: "a-secret-for-the-salon-tests-0123456789",
};

/** The widgets assistants draw, as server.ts makes them: the widget's code bundled once. */
export const widgets = widgetsOf({
  code: () => bundle(new URL("../widget.tsx", import.meta.url), { split: false }),
  plugins: [bookingsWidget],
});

/** Staff: a person, at the desk. His calls are there (`in`), as a page of the desk says. */
export const sam: Actor = { kind: "person", id: "sam", in: DESK };

/** What the scripted model does when it's called: says something, or calls a tool. */
export type Move = string | { tool: string; input?: Record<string, unknown> };

/** A model that plays its moves in order, one per call, and keeps what each call sent it. */
export function scripted(moves: Move[]) {
  const sent: LlmRequest[] = [];
  const adapter: LlmAdapter = {
    async *generate(request) {
      sent.push(request);
      const move = moves.shift();
      if (move === undefined) throw new Error(`The script has no move for call ${sent.length}.`);
      if (typeof move === "string") yield { type: "text", text: move };
      else {
        const call = { id: `call-${sent.length}`, name: move.tool, input: move.input ?? {} };
        yield { type: "tool_call", call };
      }
    },
  };
  return { adapter, sent };
}

/** The salon, in memory: the concierge on a script, Sam, and the desk he manages. */
export async function salon(options: {
  moves?: Move[];
  plugins?: Plugin[];
  settings?: Partial<Settings>;
  /** What plugin code calls outside services with (Meta's Graph API, in WhatsApp's tests). */
  fetch?: typeof fetch;
} = {}) {
  const store = memoryStore();
  const concierge = scripted(options.moves ?? []);
  // The `concierge` model alias, swapped for the script: a provider and its adapter.
  const script = definePlugin({
    name: "test-script",
    resources: {
      provider: { script: { adapter: "script" } },
      model: { concierge: "script/concierge" },
    },
    adapters: { llm: { script: concierge.adapter } },
  });
  const runtime = await createRuntime({
    store,
    ...(options.fetch ? { fetch: options.fetch } : {}),
    plugins: [...plugins({ links: LINKS, ...options.settings }), script, ...options.plugins ?? []],
  });
  await openDesk(runtime);
  return { runtime, store, concierge };
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

/** An actor as the record names it: "person sam", "agent concierge for contact c-…". */
export const who = (actor: Actor): string =>
  `${actor.kind} ${actor.id}${actor.for ? ` for ${who(actor.for as Actor)}` : ""}`;

/**
 * Who made each booking, by its slot's label, from the record (the store's events). A contact
 * is named by its name, or by the way it came in when it has none (`by mcp`).
 */
export async function bookedBy(store: Store): Promise<Record<string, string>> {
  const contacts = await store.find("contact", {}) as { _id: string; name?: string; via: string }[];
  const named = (actor: Actor): Actor => {
    const contact = actor.kind === "contact" ? contacts.find((c) => c._id === actor.id) : undefined;
    return {
      ...actor,
      ...(contact ? { id: contact.name ?? `by ${contact.via}` } : {}),
      ...(actor.for ? { for: named(actor.for as Actor) } : {}),
    };
  };
  const made: Record<string, string> = {};
  for (const event of await store.events(0)) {
    if (event.type !== "booking.created") continue;
    const { doc } = event.data as { doc: { label: string } };
    made[doc.label] = who(named(event.actor!));
  }
  return made;
}
