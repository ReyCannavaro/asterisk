import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { clientRoutes } from "./routes/clients";
import { vaultRoutes } from "./routes/vault";
import { showingRoutes } from "./routes/showing";
import { taskRoutes } from "./routes/tasks";
import { roleRoutes } from "./routes/roles";

const port = Number(process.env.PORT) || 3000;

export const app = new Elysia()
  .use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Asterisk-Showing-Mode"],
  }))
  .get("/", () => ({
    system: "Asterisk Platform API",
    status: "HEALTHY",
    version: "1.0.0",
    showingModeSupported: true,
    timestamp: new Date().toISOString(),
  }))
  .use(clientRoutes)
  .use(vaultRoutes)
  .use(showingRoutes)
  .use(taskRoutes)
  .use(roleRoutes)
  .listen(port);

console.log(`🎻 Asterisk Backend Symphony playing at http://localhost:${port}`);

export type App = typeof app;
