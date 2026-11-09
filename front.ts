/**
 * The salon's front ends, for the browser: Copilotz's web shell (the
 * sidebar, the page by address), chat and spaces, and the salon's own (a
 * space's Bookings tab). What the sign-in page says is the salon's too.
 */
import { definePlugin, type Plugin } from "copilotz";
import { webShell } from "copilotz/plugins/interfaces/web";
import { chatWeb } from "copilotz/plugins/agents/web";
import { spacesWeb } from "copilotz/plugins/access/web";
import { bookingsWeb } from "./plugins/bookings/web.tsx";

const words = definePlugin({
  name: "salon-words",
  resources: { signInPage: { about: { headline: "The salon,", quiet: "for its staff." } } },
});

export const front: Plugin[] = [webShell, chatWeb, spacesWeb, bookingsWeb, words];
