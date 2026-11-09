/** Bookings in the terminal: `/bookings` prints what you see, and the free slots. */
import { definePlugin, type Plugin } from "copilotz";
import { command } from "copilotz/terminal";

export const bookingsTerminal: Plugin = definePlugin({
  name: "bookings-terminal",
  requires: ["bookings", "terminal-shell"],
  resources: {
    commands: {
      "/bookings": command({
        description: "Show the bookings you see, and the free slots",
        async run(_args, term) {
          await term.show("bookings", {});
          await term.show("slots", {});
        },
      }),
    },
  },
});
