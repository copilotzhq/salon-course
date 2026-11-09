/**
 * The salon in the terminal, for staff: the app's plugins, how they look
 * there (Copilotz's terminal shell and chat, and `/bookings`), as Sam, at
 * the desk. Type to talk to the concierge; `/bookings` shows every booking.
 * In memory: it starts empty each time.
 *
 *   npm run terminal
 */
import process from "node:process";
import { createRuntime } from "copilotz";
import { memoryStore } from "copilotz/stores/memory";
import { chatTerminal } from "copilotz/plugins/agents/terminal";
import { terminalPlugin } from "copilotz/plugins/interfaces";
import { terminalShell } from "copilotz/plugins/interfaces/terminal";
import { terminal } from "copilotz/terminal";
import { DESK, openDesk, plugins } from "./app.ts";
import { bookingsTerminal } from "./plugins/bookings/terminal.ts";

const runtime = await createRuntime({
  store: memoryStore(),
  plugins: [
    ...plugins({ openai: process.env.OPENAI_API_KEY }),
    terminalPlugin,
    terminalShell,
    chatTerminal,
    bookingsTerminal,
  ],
});
await openDesk(runtime);
await terminal({
  runtime,
  me: "sam",
  actor: { kind: "person", id: "sam" },
  space: DESK,
  banner: "The salon",
});
await runtime.close();
