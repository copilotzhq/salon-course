/**
 * Bookings: a salon's slots, and the bookings that take them. A plugin is
 * plain objects: a collection (what's kept), an Action (what can be done),
 * a View (what anyone sees) and a resource (the slots, which the app sets).
 */
import { definePlugin, type Plugin } from "copilotz";
import { makeAction } from "./actions.ts";
import { bookingsView } from "./views.ts";

export const bookings: Plugin = definePlugin({
  name: "bookings",
  collections: {
    booking: {
      schema: {
        type: "object",
        properties: { slot: { type: "string" }, label: { type: "string" } },
        required: ["slot", "label"],
      },
    },
  },
  actions: { "booking.make": makeAction },
  views: { bookings: bookingsView },
  // The salon's times: the app sets its own.
  resources: { slots: {} },
});
