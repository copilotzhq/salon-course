/// <reference lib="dom" />
/**
 * The page's code: Copilotz's web host, drawing the salon's front ends.
 * The site's visitors come in at its root, by its chat, and become
 * customers at their first message. Staff work everywhere else: they sign
 * in, at the desk. (Only front-end code here: app.ts is the server's.)
 */
import { web } from "copilotz/web";
import { front, site } from "./front.ts";

const root = document.getElementById("app")!;
if (location.pathname === "/") await web({ root, plugins: site, arrive: { name: "site" } });
else await web({ root, plugins: front, start: async () => ({ space: "desk" }) });
