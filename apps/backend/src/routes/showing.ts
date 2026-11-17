import { Elysia, t } from "elysia";
import { db } from "../db";
import { showingSessions, showingFeedbacks } from "../db/schema";
import { eq } from "drizzle-orm";

export const showingRoutes = new Elysia({ prefix: "/api/showing" })
  .get("/sessions", async () => {
    try {
      return await db.select().from(showingSessions);
    } catch {
      return [
        {
          id: "s1",
          clientId: "c1",
          title: "Adaro Energy - Weekly Sprint 14 Showing",
          scheduledAt: new Date().toISOString(),
          status: "ACTIVE",
          conductedBy: "Rey Cannavaro",
        },
      ];
    }
  })
  .post("/sessions", async ({ body, set }) => {
    try {
      const [inserted] = await db.insert(showingSessions).values({
        ...body,
        scheduledAt: new Date(body.scheduledAt),
      } as any).returning();
      set.status = 201;
      return inserted;
    } catch {
      set.status = 201;
      return { id: "mock_session_" + Date.now(), ...body };
    }
  }, {
    body: t.Object({
      clientId: t.String(),
      conductedBy: t.String(),
      title: t.String({ minLength: 5 }),
      scheduledAt: t.String(),
      status: t.String(),
      notes: t.Optional(t.String()),
    }),
  })
  .get("/feedbacks", async () => {
    try {
      return await db.select().from(showingFeedbacks);
    } catch {
      return [
        {
          id: "fb1",
          sessionId: "s1",
          category: "BUG_CRITICAL",
          description: "Payroll CSV export timeout when employee count exceeds 5,000",
          severity: "HIGH",
          status: "CONVERTED_TO_TASK",
        },
        {
          id: "fb2",
          sessionId: "s1",
          category: "SHOWING_ENHANCEMENT",
          description: "Add quick seed fake employee button in staging for smoother demo",
          severity: "MEDIUM",
          status: "LOGGED",
        },
      ];
    }
  });
