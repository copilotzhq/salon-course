/// <reference lib="dom" />
/**
 * The page's code: Copilotz's web host, drawing the salon's front ends.
 * Staff sign in, and work at the desk. (Only front-end code here: app.ts
 * is the server's.)
 */
import { web } from "copilotz/web";
import { front } from "./front.ts";

await web({
  root: document.getElementById("app")!,
  plugins: front,
  start: async () => ({ space: "desk" }),
});
