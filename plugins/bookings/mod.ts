/**
 * Bookings: a salon's slots, and the bookings that take them.
 *
 * - **Who may call what** is the Actions' `allow`: people and contacts, and
 *   an agent working for one, may call `booking.make` and `booking.cancel`,
 *   and each runs as its caller.
 * - **The rules** are one line (the `shared` resource): a booking lives in
 *   a space, and is part of the chat it was made in. Staff, members of the
 *   space, reach every booking there. A customer, a contact, reaches only
 *   their own chat, so only their own bookings. Reads are filtered, writes
 *   checked, whoever calls.
 *
 * Whether a slot is taken is kept apart (`slot_taken`), with no rule: only
 * plugin code reads it, so a customer learns a slot is gone, never whose it is.
 */
import { definePlugin, failure, type Plugin } from "copilotz";
import { cancelAction, makeAction } from "./actions.ts";
import { bookingsView, slotsView } from "./views.ts";

export * from "./contract.ts";

export const bookings: Plugin = definePlugin({
  name: "bookings",
  requires: ["chat", "spaces"],
  collections: {
    booking: {
      schema: {
        type: "object",
        properties: {
          slot: { type: "string" },
          label: { type: "string" },
          in: { type: "string" },
          thread: { type: "string" },
          name: { type: "string" },
        },
        required: ["slot", "label", "in"],
      },
    },
    slot_taken: {
      schema: {
        type: "object",
        properties: { booking: { type: "string" } },
        required: ["booking"],
      },
    },
  },
  actions: { "booking.make": makeAction, "booking.cancel": cancelAction },
  views: { bookings: bookingsView, slots: slotsView },
  resources: {
    // The rules, at the data: a booking is in a space, and part of its chat.
    shared: { booking: { part: "thread" } },
    // The salon's times: the app sets its own.
    slots: {},
  },
  // Bookings change only through their Actions, never written directly from outside.
  guard: (_actor, { collection, access, direct }) => {
    if (collection === "booking" && direct && access === "write") {
      throw failure("forbidden", "Bookings change through their Actions.", { public: true });
    }
    return undefined;
  },
});
