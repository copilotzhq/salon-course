/**
 * The salon: its plugins, in order. Copilotz merges them into one app, and
 * a later plugin's resources patch an earlier one's: the salon sets the
 * slots that bookings declares.
 *
 * Staff are people, members of the salon's space, the desk. Customers are
 * contacts: each has a chat of their own at the desk (chat's `thread`), and
 * nothing else.
 */
import { type Actor, definePlugin, type Plugin, type Runtime } from "copilotz";
import { models } from "copilotz/plugins/models";
import { chat } from "copilotz/plugins/agents";
import { access } from "copilotz/plugins/access";
import { bookings } from "./plugins/bookings/mod.ts";

/** The salon's space: staff are its members, and every customer's chat is in it. */
export const DESK = "desk";

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
  return [models, chat, ...access, bookings, salon];
}

/** Sam, and the desk he manages: staff are its members. */
export async function openDesk(runtime: Runtime): Promise<void> {
  const sam: Actor = { kind: "person", id: "sam" };
  await runtime.call("person.set", { person: "sam", name: "Sam" });
  await runtime.call("space.create", { id: DESK, name: "Front desk" }, { actor: sam });
}
