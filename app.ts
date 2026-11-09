/**
 * The salon: its plugins, in order, in every process (the server, the
 * terminal, tests). Copilotz merges them into one app, and a later plugin's
 * resources patch an earlier one's: the salon's settings come last. The
 * host reads the environment and passes it in; nothing here reads it, so
 * tests run the same list.
 *
 * Staff are people, members of the salon's space, the desk. Customers are
 * contacts: each has a chat of their own at the desk (chat's `thread`), and
 * nothing else. The concierge, the salon's agent, answers every chat there.
 * Assistants outside (ChatGPT, Claude, Gemini) come in over MCP, each
 * conversation a contact.
 */
import { type Actor, definePlugin, type Plugin, type Runtime } from "copilotz";
import { models } from "copilotz/plugins/models";
import { chat } from "copilotz/plugins/agents";
import { access } from "copilotz/plugins/access";
import { mcp } from "copilotz/plugins/interfaces";
import { bookings } from "./plugins/bookings/mod.ts";

/** The salon's space: staff are its members, and every customer's chat is in it. */
export const DESK = "desk";

export type Settings = {
  /** OpenAI's API key; without it, the concierge answers with the offline fake model. */
  openai?: string;
  /** Where the app is, and a secret of 32 bytes or more: what MCP's ids are made with. */
  links: { origin: string; secret: string };
};

/** The app's settings, for the plugins before it. */
function salon(settings: Settings): Plugin {
  return definePlugin({
    name: "salon",
    resources: {
      // The salon's week: each slot is booked once.
      slots: {
        "tue-10": "Tue 10:00",
        "tue-11": "Tue 11:00",
        "wed-15": "Wed 15:00",
        "thu-09": "Thu 09:00",
        "fri-14": "Fri 14:00",
        "sat-10": "Sat 10:00",
      },
      provider: settings.openai ? { openai: { apiKey: settings.openai } } : {},
      // The concierge thinks with `concierge`, a model by its alias: tests swap in a scripted one.
      model: {
        concierge: settings.openai ? { model: "openai/gpt-6-luna", effort: "low" } : "fake/echo",
      },
      agents: {
        concierge: {
          // New spaces start with it: the desk's chats are answered by it.
          default: true,
          instructions: "You book the salon's slots. List the free ones before you book, " +
            "and book only what the person asked for.",
          model: "concierge",
          tools: ["list_slots", "book", "my_bookings", "cancel_booking"],
        },
      },
      links: settings.links,
      // An MCP server at /mcp/salon, for ChatGPT, Claude, Gemini, any MCP client. No sign-in yet:
      // each conversation is a contact, in a chat of its own at the desk.
      mcp: {
        salon: {
          in: DESK,
          // Who calls, as its chats show it.
          client: "Assistant",
          title: "The salon",
          instructions: "Book the salon's slots for the person you're helping.",
          tools: {
            list_slots: { annotations: { readOnly: true } },
            book: {},
            my_bookings: { annotations: { readOnly: true } },
            cancel_booking: {},
          },
        },
      },
    },
  });
}

/** Every plugin the salon runs, in order. */
export function plugins(settings: Settings): Plugin[] {
  return [models, chat, ...access, mcp, bookings, salon(settings)];
}

/** Sam, and the desk he manages: staff are its members. */
export async function openDesk(runtime: Runtime): Promise<void> {
  const sam: Actor = { kind: "person", id: "sam" };
  await runtime.call("person.set", { person: "sam", name: "Sam" });
  await runtime.call("space.create", { id: DESK, name: "Front desk" }, { actor: sam });
}
