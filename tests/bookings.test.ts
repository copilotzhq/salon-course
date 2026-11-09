/**
 * The salon's one contract, called directly: what a person at the desk and
 * a customer in their chat can do, and what each sees.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { DESK } from "../app.ts";
import { customer, salon, sam, seen } from "./kit.ts";

test("staff see every booking; a customer sees only their own", async () => {
  const { runtime } = await salon();
  try {
    const bia = await customer(runtime, "Bia");
    const caio = await customer(runtime, "Caio");
    await runtime.call("booking.make", { slot: "tue-10", thread: bia.thread }, {
      actor: bia.actor,
    });
    await runtime.call("booking.make", { slot: "wed-15", thread: caio.thread }, {
      actor: caio.actor,
    });
    // A walk-in, booked by Sam at the desk: in the space, in no chat.
    await runtime.call("booking.make", { slot: "thu-09", name: "Rui" }, { actor: sam });

    assert.equal(
      await seen(runtime, "bookings", sam),
      "Tue 10:00 (tue-10), for Bia\nWed 15:00 (wed-15), for Caio\nThu 09:00 (thu-09), for Rui",
    );
    assert.equal(await seen(runtime, "bookings", bia.actor), "Tue 10:00 (tue-10), for Bia");
    assert.equal(await seen(runtime, "bookings", caio.actor), "Wed 15:00 (wed-15), for Caio");
    // Everyone sees the same free slots, and nobody learns whose the others are.
    assert.equal(
      await seen(runtime, "slots", bia.actor),
      "Free: Tue 11:00 (tue-11), Fri 14:00 (fri-14), Sat 10:00 (sat-10).",
    );
  } finally {
    await runtime.close();
  }
});

test("a customer can't book into another's chat, take a slot, or cancel what isn't theirs", async () => {
  const { runtime } = await salon();
  try {
    const bia = await customer(runtime, "Bia");
    const caio = await customer(runtime, "Caio");
    const { booking } = await runtime.call<{ booking: string }>("booking.make", {
      slot: "tue-10",
      thread: bia.thread,
    }, { actor: bia.actor });

    await assert.rejects(
      runtime.call("booking.make", { slot: "tue-11", thread: bia.thread }, { actor: caio.actor }),
      /That chat isn't one of yours/,
    );
    // At the desk, outside his chat: the booking would be out of his reach, so the rules refuse it.
    await assert.rejects(
      runtime.call("booking.make", { slot: "tue-11" }, { actor: { ...caio.actor, in: DESK } }),
      /would be out of your reach/,
    );
    await assert.rejects(
      runtime.call("booking.make", { slot: "tue-10", thread: caio.thread }, { actor: caio.actor }),
      /Tue 10:00 is taken/,
    );
    await assert.rejects(
      runtime.call("booking.cancel", { booking }, { actor: caio.actor }),
      /No booking of yours/,
    );
    // Refused writes leave nothing behind: Tue 11:00 is still free.
    assert.match(await seen(runtime, "slots", caio.actor), /^Free: Tue 11:00 \(tue-11\)/);
    // Bia cancels her own, and the slot is free again.
    await runtime.call("booking.cancel", { booking }, { actor: bia.actor });
    assert.equal(await seen(runtime, "bookings", bia.actor), "No bookings.");
    assert.match(await seen(runtime, "slots", caio.actor), /^Free: Tue 10:00 \(tue-10\)/);
  } finally {
    await runtime.close();
  }
});
