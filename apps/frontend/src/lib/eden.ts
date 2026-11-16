import { treaty } from "@elysiajs/eden";
import type { App } from "@asterisk/backend";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";

export const api = treaty<App>(API_URL);
