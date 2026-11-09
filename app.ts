/**
 * The salon: its plugins, in order. Copilotz merges them into one app, and
 * a later plugin's resources patch an earlier one's: the salon sets the
 * slots that bookings declares.
 */
import { definePlugin, type Plugin } from "copilotz";
import { bookings } from "./plugins/bookings/mod.ts";

const salon = definePlugin({
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
  },
});

export function plugins(): Plugin[] {
  return [bookings, salon];
}
