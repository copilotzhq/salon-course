/**
 * What other plugins and the app import from bookings: the shapes of its
 * records and settings. Everything else they reach by name: its Actions
 * (`booking.make`, `booking.cancel`), its Views (`bookings`, `slots`) and
 * its tools (`list_slots`, `book`, `my_bookings`, `cancel_booking`).
 */

/** The salon's times, by id: the `slots` resource, which the app sets. */
export type Slots = Record<string, string>;

/**
 * A booking: a slot, in the salon's space (`in`), and part of the chat it
 * was made in (`thread`), when it was made in one. Who reaches the chat
 * reaches the booking: its customer, and the space's staff.
 */
export type Booking = {
  _id: string;
  slot: string;
  label: string;
  in: string;
  thread?: string;
  /** Who it's for, when staff book at the desk without a chat. */
  name?: string;
};

/** A booking as anyone sees it, and whom it's for: the name staff gave, its chat's, a walk-in. */
export type Reached = Booking & { for: string };

/** A slot nobody has booked yet. */
export type Free = { slot: string; label: string };
