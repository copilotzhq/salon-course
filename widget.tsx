/// <reference lib="dom" />
/**
 * The widget's code, for an assistant's sandbox: Copilotz's widget host,
 * drawing the tool's call through the salon's widget View, as the
 * conversation's customer. server.ts bundles it as one file.
 */
import { widget } from "copilotz/web/widget";
import { bookingsWidget } from "./plugins/bookings/web.tsx";

await widget({ plugins: [bookingsWidget], root: document.getElementById("app")! });
