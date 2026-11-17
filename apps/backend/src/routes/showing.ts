import { Elysia, t } from "elysia";
import { db } from "../db";
import { showingSessions, showingFeedbacks, clients, users, tasks, taskActivities } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { scrubSensitiveFields } from "../lib/showing-mask";

export const showingRoutes = new Elysia({ prefix: "/api/showing" })
  .derive(({ headers }) => {
    const isShowing = headers["x-asterisk-showing-mode"] === "1" || headers["x-asterisk-showing-mode"] === "true";
    return { isShowingMode: isShowing };
  })

  // 1. GET /api/showing/sessions - List showing sessions with enriched client & feedback counts
  .get("/sessions", async ({ query, isShowingMode }) => {
    try {
      const allSessions = await db.select().from(showingSessions).orderBy(desc(showingSessions.scheduledAt));
      const allClients = await db.select().from(clients);
      const allFeedbacks = await db.select().from(showingFeedbacks);
      const allUsers = await db.select().from(users);

      let enriched = allSessions.map((session) => {
        const client = allClients.find((c) => c.id === session.clientId);
        const conductor = allUsers.find((u) => u.id === session.conductedBy);
        const sessionFeedbacks = allFeedbacks.filter((f) => f.sessionId === session.id);
        const convertedCount = sessionFeedbacks.filter((f) => f.status === "CONVERTED_TO_TASK").length;

        const clientName = client ? client.name : "Unknown Client";
        const clientAlias = client?.showingAlias ?? "Client-Masked";

        return {
          ...session,
          scheduledAt: session.scheduledAt ? session.scheduledAt.toISOString() : new Date().toISOString(),
          createdAt: session.createdAt ? session.createdAt.toISOString() : new Date().toISOString(),
          clientCode: client?.code ?? "",
          clientName: isShowingMode ? clientAlias : clientName,
          clientShowingAlias: clientAlias,
          clientIndustry: client?.industry ?? "Enterprise",
          conductedByName: conductor?.fullName ?? "Rey Cannavaro",
          feedbacksCount: sessionFeedbacks.length,
          convertedTasksCount: convertedCount,
        };
      });

      // Filter by clientId if requested
      if (query.clientId) {
        enriched = enriched.filter((s) => s.clientId === query.clientId);
      }

      // Filter by status if requested
      if (query.status) {
        enriched = enriched.filter((s) => s.status === query.status);
      }

      // Sort: ACTIVE first, then SCHEDULED, then others
      enriched.sort((a, b) => {
        if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
        if (b.status === "ACTIVE" && a.status !== "ACTIVE") return 1;
        return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
      });

      return scrubSensitiveFields(enriched, isShowingMode);
    } catch {
      // Graceful fallback if database is loading or running locally without connection
      const mockSessions = [
        {
          id: "session-adaro-demo",
          clientId: "client-adaro",
          conductedBy: "user-rey-superadmin",
          conductedByName: "Rey Cannavaro",
          title: "Adaro Energy - Mining Payroll & Shift Overtime Showing",
          scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
          status: "ACTIVE",
          notes: "Live demo of 3-shift mining overtime calculations and attendance biometric export.",
          createdAt: new Date().toISOString(),
          clientCode: "ADARO",
          clientName: isShowingMode ? "Client-A (Energy)" : "PT Adaro Energy Indonesia Tbk",
          clientShowingAlias: "Client-A (Energy)",
          clientIndustry: "Energy & Mining",
          feedbacksCount: 2,
          convertedTasksCount: 1,
        },
        {
          id: "session-mandiri-sso",
          clientId: "client-mandiri",
          conductedBy: "user-rey-superadmin",
          conductedByName: "Rey Cannavaro",
          title: "Bank Mandiri - SSO Active Directory & Vault Access Review",
          scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          status: "SCHEDULED",
          notes: "Showing SAML 2.0 integration and zero-leak showing mode credentials.",
          createdAt: new Date().toISOString(),
          clientCode: "MANDIRI",
          clientName: isShowingMode ? "Client-B (Banking)" : "PT Bank Mandiri (Persero) Tbk",
          clientShowingAlias: "Client-B (Banking)",
          clientIndustry: "Banking & Finance",
          feedbacksCount: 0,
          convertedTasksCount: 0,
        },
      ];
      return scrubSensitiveFields(mockSessions, isShowingMode);
    }
  }, {
    query: t.Object({
      clientId: t.Optional(t.String()),
      status: t.Optional(t.String()),
    }),
  })

  // 2. GET /api/showing/sessions/:id - Detail session with feedbacks
  .get("/sessions/:id", async ({ params, set, isShowingMode }) => {
    try {
      const [session] = await db.select().from(showingSessions).where(eq(showingSessions.id, params.id));
      if (!session) {
        set.status = 404;
        return { error: "Session not found" };
      }

      const [client] = await db.select().from(clients).where(eq(clients.id, session.clientId));
      const sessionFeedbacks = await db
        .select()
        .from(showingFeedbacks)
        .where(eq(showingFeedbacks.sessionId, params.id))
        .orderBy(desc(showingFeedbacks.createdAt));

      const clientName = client ? client.name : "Unknown Client";
      const clientAlias = client?.showingAlias ?? "Client-Masked";

      return scrubSensitiveFields({
        ...session,
        scheduledAt: session.scheduledAt ? session.scheduledAt.toISOString() : new Date().toISOString(),
        clientCode: client?.code ?? "",
        clientName: isShowingMode ? clientAlias : clientName,
        clientShowingAlias: clientAlias,
        feedbacks: sessionFeedbacks.map((f) => ({
          ...f,
          createdAt: f.createdAt ? f.createdAt.toISOString() : new Date().toISOString(),
        })),
      }, isShowingMode);
    } catch (err: any) {
      set.status = 500;
      return { error: "FETCH_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })

  // 3. POST /api/showing/sessions - Schedule a new showing session
  .post("/sessions", async ({ body, set }) => {
    try {
      const sessionId = `session-${crypto.randomUUID().slice(0, 8)}`;
      const newSession = {
        id: sessionId,
        clientId: body.clientId,
        conductedBy: body.conductedBy || "user-rey-superadmin",
        title: body.title.trim(),
        scheduledAt: new Date(body.scheduledAt),
        status: body.status || "SCHEDULED",
        notes: body.notes?.trim() || null,
      };

      const [inserted] = await db.insert(showingSessions).values(newSession).returning();
      set.status = 201;
      return {
        ...inserted,
        scheduledAt: inserted.scheduledAt.toISOString(),
        createdAt: inserted.createdAt.toISOString(),
      };
    } catch (err: any) {
      set.status = 500;
      return { error: "CREATE_SESSION_FAILED", message: err.message };
    }
  }, {
    body: t.Object({
      clientId: t.String(),
      conductedBy: t.Optional(t.String()),
      title: t.String({ minLength: 3 }),
      scheduledAt: t.String(),
      status: t.Optional(t.String()),
      notes: t.Optional(t.String()),
    }),
  })

  // 4. PATCH /api/showing/sessions/:id/status - Update session status (e.g. Start Demo, Complete)
  .patch("/sessions/:id/status", async ({ params, body, set }) => {
    try {
      const [updated] = await db
        .update(showingSessions)
        .set({ status: body.status })
        .where(eq(showingSessions.id, params.id))
        .returning();

      if (!updated) {
        set.status = 404;
        return { error: "Session not found" };
      }

      return {
        ...updated,
        scheduledAt: updated.scheduledAt.toISOString(),
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err: any) {
      set.status = 500;
      return { error: "UPDATE_STATUS_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      status: t.String(),
    }),
  })

  // 5. DELETE /api/showing/sessions/:id - Remove a showing session
  .delete("/sessions/:id", async ({ params, set }) => {
    try {
      await db.delete(showingSessions).where(eq(showingSessions.id, params.id));
      return { success: true, deletedId: params.id };
    } catch (err: any) {
      set.status = 500;
      return { error: "DELETE_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })

  // 6. GET /api/showing/sessions/:id/feedbacks - List feedbacks for session
  .get("/sessions/:id/feedbacks", async ({ params, set }) => {
    try {
      const feedbacks = await db
        .select()
        .from(showingFeedbacks)
        .where(eq(showingFeedbacks.sessionId, params.id))
        .orderBy(desc(showingFeedbacks.createdAt));

      return feedbacks.map((f) => ({
        ...f,
        createdAt: f.createdAt ? f.createdAt.toISOString() : new Date().toISOString(),
      }));
    } catch (err: any) {
      set.status = 500;
      return { error: "FETCH_FEEDBACKS_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })

  // 7. POST /api/showing/sessions/:id/feedbacks - Quick Log Feedback during live session
  .post("/sessions/:id/feedbacks", async ({ params, body, set }) => {
    try {
      const feedbackId = `fb-${crypto.randomUUID().slice(0, 8)}`;
      const newFeedback = {
        id: feedbackId,
        sessionId: params.id,
        category: body.category,
        description: body.description.trim(),
        severity: body.severity || "MEDIUM",
        status: "LOGGED",
      };

      const [inserted] = await db.insert(showingFeedbacks).values(newFeedback).returning();
      set.status = 201;
      return {
        ...inserted,
        createdAt: inserted.createdAt.toISOString(),
      };
    } catch (err: any) {
      set.status = 500;
      return { error: "LOG_FEEDBACK_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      category: t.String(),
      description: t.String({ minLength: 3 }),
      severity: t.Optional(t.String()),
    }),
  })

  // 8. POST /api/showing/feedbacks/:feedbackId/convert-to-task - 1-Click Convert to Kanban Task
  .post("/feedbacks/:feedbackId/convert-to-task", async ({ params, body, set }) => {
    try {
      const [feedback] = await db
        .select()
        .from(showingFeedbacks)
        .where(eq(showingFeedbacks.id, params.feedbackId));

      if (!feedback) {
        set.status = 404;
        return { error: "Feedback not found" };
      }

      const [session] = await db
        .select()
        .from(showingSessions)
        .where(eq(showingSessions.id, feedback.sessionId));

      if (!session) {
        set.status = 404;
        return { error: "Associated showing session not found" };
      }

      // Map module tag based on category or body
      let moduleTag = body?.moduleTag || "DEV";
      if (!body?.moduleTag) {
        if (feedback.category === "BUG_CRITICAL") moduleTag = "SECURITY";
        else if (feedback.category === "CLIENT_CUSTOM_REQ") moduleTag = "PAYROLL";
        else moduleTag = "DESIGN";
      }

      const taskId = `task-${crypto.randomUUID().slice(0, 8)}`;
      const taskTitle = body?.title?.trim() || `[Feedback] ${feedback.description.slice(0, 70)}`;
      const taskDescription = `Converted from Showing Session: "${session.title}"\nSeverity: ${feedback.severity}\nCategory: ${feedback.category}\n\nClient Feedback Details:\n${feedback.description}`;

      const [createdTask] = await db.insert(tasks).values({
        id: taskId,
        feedbackId: feedback.id,
        clientId: session.clientId,
        title: taskTitle,
        description: taskDescription,
        moduleTag: moduleTag,
        status: "TODO",
        assignedTo: "user-rey-superadmin",
        positionOrder: 1,
      }).returning();

      // Update feedback status
      const [updatedFeedback] = await db
        .update(showingFeedbacks)
        .set({ status: "CONVERTED_TO_TASK" })
        .where(eq(showingFeedbacks.id, feedback.id))
        .returning();

      // Insert audit activity for task
      try {
        await db.insert(taskActivities).values({
          id: `act-${crypto.randomUUID().slice(0, 8)}`,
          taskId: taskId,
          userId: "user-rey-superadmin",
          action: "CONVERTED_FROM_FEEDBACK",
          comment: `Ticket created automatically from Showing Session feedback (${feedback.category})`,
        });
      } catch (actErr) {
        console.warn("[Asterisk Task Activity Warning]:", actErr);
      }

      set.status = 201;
      return {
        task: {
          ...createdTask,
          createdAt: createdTask.createdAt.toISOString(),
          updatedAt: createdTask.updatedAt.toISOString(),
        },
        feedback: {
          ...updatedFeedback,
          createdAt: updatedFeedback.createdAt.toISOString(),
        },
      };
    } catch (err: any) {
      set.status = 500;
      return { error: "CONVERT_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ feedbackId: t.String() }),
    body: t.Optional(t.Object({
      title: t.Optional(t.String()),
      moduleTag: t.Optional(t.String()),
    })),
  })

  // 9. DELETE /api/showing/feedbacks/:feedbackId - Remove feedback
  .delete("/feedbacks/:feedbackId", async ({ params, set }) => {
    try {
      await db.delete(showingFeedbacks).where(eq(showingFeedbacks.id, params.feedbackId));
      return { success: true, deletedId: params.feedbackId };
    } catch (err: any) {
      set.status = 500;
      return { error: "DELETE_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ feedbackId: t.String() }),
  });
