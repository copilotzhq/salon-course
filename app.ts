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
 * conversation a contact; so do the site's visitors, by its chat, and
 * anyone who writes to the salon's WhatsApp number.
 */
import { type Actor, definePlugin, type Plugin, type Runtime } from "copilotz";
import { models } from "copilotz/plugins/models";
import { chat } from "copilotz/plugins/agents";
import { access, email, emailSignIn } from "copilotz/plugins/access";
import { mcp, webLines, whatsapp } from "copilotz/plugins/interfaces";
import type { Widgets } from "copilotz/web/server";
import { bookings } from "./plugins/bookings/mod.ts";

/** The salon's space: staff are its members, and every customer's chat is in it. */
export const DESK = "desk";

export type Settings = {
  /** OpenAI's API key; without it, the concierge answers with the offline fake model. */
  openai?: string;
  /** Where the app is, and a secret (32 bytes or more) that MCP's and the site's ids come from. */
  links: { origin: string; secret: string };
  /** The widgets assistants draw (`widgetsOf`): without them, MCP answers in text alone. */
  widgets?: Widgets;
  /**
   * A WhatsApp number, open to anyone: Meta's ids, its token, its app's secret, and the token
   * its webhook is verified with. `quiet`: seconds a burst of messages may go on before the
   * concierge answers them at once (4 unless said).
   */
  whatsapp?: { phoneId: string; token: string; secret: string; verify: string; quiet?: number };
  /**
   * Staff signing in by email, where devSignIn can't (a public origin): Resend's API key, and
   * the address it sends from. Staff are invited (`openDesk`); nobody signs up.
   */
  email?: { apiKey: string; from: string };
  /** Behind a proxy: the header it names callers by, and how many proxies append to it. */
  caller?: { header: string; hops?: number };
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
      // The site's chat: a visitor is a contact, in a chat of its own at the desk.
      web: { site: { in: DESK, agent: "concierge", title: "Site visitor" } },
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
            book: { widget: "bookings.widget", invoking: "Booking…", invoked: "Booked." },
            my_bookings: { annotations: { readOnly: true }, widget: "bookings.widget" },
            cancel_booking: {},
            // What the widget's buttons do: the same Actions, never the model's to call.
            book_slot: { action: "booking.make", title: "Book a slot" },
            cancel_slot: { action: "booking.cancel", title: "Cancel a booking" },
          },
        },
      },
      ...(settings.widgets ? { widgets: settings.widgets } : {}),
      ...(settings.email
        ? {
          email: { adapter: "resend", ...settings.email },
          emailSignIn: { app: "The salon", signUp: false },
        }
        : {}),
      // Who calls, as the proxy before the app says: what the site's and MCP's limits count by.
      ...(settings.caller ? { caller: settings.caller } : {}),
      // A customer who writes to the number is a contact, in a chat of their own at the desk.
      ...(settings.whatsapp
        ? { whatsapp: { salon: { in: DESK, agent: "concierge", ...settings.whatsapp } } }
        : {}),
    },
  });
}

/** Every plugin the salon runs, in order. */
export function plugins(settings: Settings): Plugin[] {
  return [
    models,
    chat,
    ...access,
    ...(settings.email ? [email, emailSignIn] : []),
    mcp,
    webLines,
    ...(settings.whatsapp ? [whatsapp] : []),
    bookings,
    salon(settings),
  ];
}

/**
 * Sam, and the desk he manages: staff are its members. Kept in a store, the desk is there the
 * next time, so it's made only once. With his email, Sam is invited: a link where he chooses a
 * password, sent at each start until he has.
 */
export async function openDesk(runtime: Runtime, staff?: { email: string }): Promise<void> {
  const sam: Actor = { kind: "person", id: "sam" };
  await runtime.call("person.set", { person: "sam", name: "Sam" });
  await runtime.call("space.create", { id: DESK, name: "Front desk" }, { actor: sam })
    .catch((error) => {
      if (error.code !== "duplicate_key") throw error;
    });
  if (staff) await runtime.call("email.invite", { email: staff.email, person: "sam", name: "Sam" });
}
