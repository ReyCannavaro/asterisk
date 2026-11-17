import { Elysia, t } from "elysia";
import { db } from "../db";
import { tasks, clients, users, showingFeedbacks, taskActivities } from "../db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { scrubSensitiveFields } from "../lib/showing-mask";

export const taskRoutes = new Elysia({ prefix: "/api/tasks" })
  .derive(({ headers }) => {
    const isShowing = headers["x-asterisk-showing-mode"] === "1" || headers["x-asterisk-showing-mode"] === "true";
    return { isShowingMode: isShowing };
  })

  // 1. GET /api/tasks - List all tasks enriched with client, assignee, feedback, and activities
  .get("/", async ({ query, isShowingMode }) => {
    try {
      const allTasks = await db.select().from(tasks).orderBy(asc(tasks.positionOrder), desc(tasks.createdAt));
      const allClients = await db.select().from(clients);
      const allUsers = await db.select().from(users);
      const allFeedbacks = await db.select().from(showingFeedbacks);
      const allActivities = await db.select().from(taskActivities);

      let enriched = allTasks.map((task) => {
        const client = allClients.find((c) => c.id === task.clientId);
        const assignee = allUsers.find((u) => u.id === task.assignedTo);
        const feedback = task.feedbackId ? allFeedbacks.find((f) => f.id === task.feedbackId) : undefined;
        const taskActs = allActivities.filter((a) => a.taskId === task.id);

        const clientName = client ? client.name : "Unknown Client";
        const clientAlias = client?.showingAlias ?? "Client-Masked";

        return {
          ...task,
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: task.updatedAt ? task.updatedAt.toISOString() : new Date().toISOString(),
          clientCode: client?.code ?? "",
          clientName: isShowingMode ? clientAlias : clientName,
          clientShowingAlias: clientAlias,
          assignedToName: assignee?.fullName ?? "Rey Cannavaro",
          assignedToAvatar: assignee?.avatarUrl ?? null,
          sourceFeedbackCategory: feedback?.category ?? null,
          sourceFeedbackSeverity: feedback?.severity ?? null,
          activitiesCount: taskActs.length,
        };
      });

      // Filter by clientId
      if (query.clientId) {
        enriched = enriched.filter((t) => t.clientId === query.clientId);
      }

      // Filter by moduleTag
      if (query.moduleTag) {
        enriched = enriched.filter((t) => t.moduleTag === query.moduleTag);
      }

      // Filter by status
      if (query.status) {
        enriched = enriched.filter((t) => t.status === query.status);
      }

      return scrubSensitiveFields(enriched, isShowingMode);
    } catch {
      // Fallback seed tasks matching FigCraft TeamUnity board
      const mockTasks = [
        {
          id: "task-01",
          clientId: "client-adaro",
          feedbackId: "fb-01",
          title: "Formula Overtime Shift 3 Tambang Tanjung",
          description: "Penyesuaian formula overtime multiplier 2.5x untuk shift malam tambang",
          moduleTag: "PAYROLL",
          status: "TODO",
          dueDate: "2026-02-15",
          assignedTo: "user-rey-superadmin",
          assignedToName: "Rey Cannavaro",
          positionOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clientCode: "ADARO",
          clientName: isShowingMode ? "Client-A (Energy)" : "PT Adaro Energy Indonesia Tbk",
          clientShowingAlias: "Client-A (Energy)",
          sourceFeedbackCategory: "BUG_CRITICAL",
          sourceFeedbackSeverity: "HIGH",
          activitiesCount: 2,
        },
        {
          id: "task-02",
          clientId: "client-mandiri",
          feedbackId: null,
          title: "Integrasi SSO Active Directory SAML 2.0",
          description: "Gateway federasi login karyawan Bank Mandiri dengan zero-leak vault",
          moduleTag: "SECURITY",
          status: "IN_PROGRESS",
          dueDate: "2026-02-10",
          assignedTo: "user-rey-superadmin",
          assignedToName: "Rey Cannavaro",
          positionOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clientCode: "MANDIRI",
          clientName: isShowingMode ? "Client-B (Banking)" : "PT Bank Mandiri (Persero) Tbk",
          clientShowingAlias: "Client-B (Banking)",
          sourceFeedbackCategory: null,
          sourceFeedbackSeverity: null,
          activitiesCount: 3,
        },
        {
          id: "task-03",
          clientId: "client-telkomsel",
          feedbackId: null,
          title: "Export Rekap Biometrik Regional Medan & Surabaya",
          description: "Optimalisasi batch worker untuk penarikan 50.000 data log absensi",
          moduleTag: "ATTENDANCE",
          status: "REVIEW_QA",
          dueDate: "2026-02-05",
          assignedTo: "user-rey-superadmin",
          assignedToName: "Rey Cannavaro",
          positionOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clientCode: "TELKOMSEL",
          clientName: isShowingMode ? "Client-C (Telco)" : "PT Telekomunikasi Selular",
          clientShowingAlias: "Client-C (Telco)",
          sourceFeedbackCategory: null,
          sourceFeedbackSeverity: null,
          activitiesCount: 1,
        },
        {
          id: "task-04",
          clientId: "client-indofood",
          feedbackId: null,
          title: "Kalkulator PPh 21 TER Skema Bulanan 2026",
          description: "Implementasi tarif efektif rata-rata sesuai regulasi perpajakan terbaru",
          moduleTag: "PAYROLL",
          status: "COMPLETE",
          dueDate: "2026-01-20",
          assignedTo: "user-rey-superadmin",
          assignedToName: "Rey Cannavaro",
          positionOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clientCode: "INDOFOOD",
          clientName: isShowingMode ? "Client-D (FMCG)" : "PT Indofood Sukses Makmur Tbk",
          clientShowingAlias: "Client-D (FMCG)",
          sourceFeedbackCategory: null,
          sourceFeedbackSeverity: null,
          activitiesCount: 4,
        },
      ];
      return scrubSensitiveFields(mockTasks, isShowingMode);
    }
  }, {
    query: t.Object({
      clientId: t.Optional(t.String()),
      moduleTag: t.Optional(t.String()),
      status: t.Optional(t.String()),
    }),
  })

  // 2. GET /api/tasks/:id - Detail task with full activity timeline
  .get("/:id", async ({ params, set, isShowingMode }) => {
    try {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, params.id));
      if (!task) {
        set.status = 404;
        return { error: "Task not found" };
      }

      const [client] = await db.select().from(clients).where(eq(clients.id, task.clientId));
      const [assignee] = task.assignedTo ? await db.select().from(users).where(eq(users.id, task.assignedTo)) : [undefined];
      const [feedback] = task.feedbackId ? await db.select().from(showingFeedbacks).where(eq(showingFeedbacks.id, task.feedbackId)) : [undefined];
      const activities = await db
        .select()
        .from(taskActivities)
        .where(eq(taskActivities.taskId, params.id))
        .orderBy(desc(taskActivities.createdAt));

      const allUsers = await db.select().from(users);
      const enrichedActivities = activities.map((act) => {
        const actUser = allUsers.find((u) => u.id === act.userId);
        return {
          ...act,
          userFullName: actUser?.fullName ?? "Rey Cannavaro",
          createdAt: act.createdAt ? act.createdAt.toISOString() : new Date().toISOString(),
        };
      });

      const clientName = client ? client.name : "Unknown Client";
      const clientAlias = client?.showingAlias ?? "Client-Masked";

      return scrubSensitiveFields({
        ...task,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: task.updatedAt ? task.updatedAt.toISOString() : new Date().toISOString(),
        clientCode: client?.code ?? "",
        clientName: isShowingMode ? clientAlias : clientName,
        clientShowingAlias: clientAlias,
        assignedToName: assignee?.fullName ?? "Rey Cannavaro",
        assignedToAvatar: assignee?.avatarUrl ?? null,
        sourceFeedback: feedback ? {
          ...feedback,
          createdAt: feedback.createdAt ? feedback.createdAt.toISOString() : new Date().toISOString(),
        } : null,
        activities: enrichedActivities,
      }, isShowingMode);
    } catch (err: any) {
      set.status = 500;
      return { error: "FETCH_TASK_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })

  // 3. POST /api/tasks - Create new task in Kanban board
  .post("/", async ({ body, set }) => {
    try {
      const taskId = `task-${crypto.randomUUID().slice(0, 8)}`;
      const newTask = {
        id: taskId,
        clientId: body.clientId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        moduleTag: body.moduleTag,
        status: body.status || "TODO",
        assignedTo: body.assignedTo || "user-rey-superadmin",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        positionOrder: body.positionOrder ?? 1,
      };

      const [inserted] = await db.insert(tasks).values(newTask).returning();

      // Record activity creation
      try {
        await db.insert(taskActivities).values({
          id: `act-${crypto.randomUUID().slice(0, 8)}`,
          taskId: taskId,
          userId: "user-rey-superadmin",
          action: "TASK_CREATED",
          comment: "Task created in Kanban delivery backlog",
        });
      } catch (actErr) {
        console.warn("[Asterisk Task Activity Warning]:", actErr);
      }

      set.status = 201;
      return {
        ...inserted,
        dueDate: inserted.dueDate ? inserted.dueDate.toISOString() : null,
        createdAt: inserted.createdAt.toISOString(),
        updatedAt: inserted.updatedAt.toISOString(),
      };
    } catch (err: any) {
      set.status = 500;
      return { error: "CREATE_TASK_FAILED", message: err.message };
    }
  }, {
    body: t.Object({
      clientId: t.String(),
      title: t.String({ minLength: 3 }),
      description: t.Optional(t.String()),
      moduleTag: t.String(),
      status: t.Optional(t.String()),
      assignedTo: t.Optional(t.String()),
      dueDate: t.Optional(t.String()),
      positionOrder: t.Optional(t.Number()),
    }),
  })

  // 4. PATCH /api/tasks/:id/status - Move task between Kanban columns
  .patch("/:id/status", async ({ params, body, set }) => {
    try {
      const [existing] = await db.select().from(tasks).where(eq(tasks.id, params.id));
      if (!existing) {
        set.status = 404;
        return { error: "Task not found" };
      }

      const [updated] = await db
        .update(tasks)
        .set({
          status: body.status,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, params.id))
        .returning();

      // Record movement activity
      try {
        await db.insert(taskActivities).values({
          id: `act-${crypto.randomUUID().slice(0, 8)}`,
          taskId: params.id,
          userId: "user-rey-superadmin",
          action: "STATUS_CHANGED",
          previousValue: existing.status,
          newValue: body.status,
          comment: body.comment || `Moved status from ${existing.status} to ${body.status}`,
        });
      } catch (actErr) {
        console.warn("[Asterisk Task Activity Warning]:", actErr);
      }

      return {
        ...updated,
        dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err: any) {
      set.status = 500;
      return { error: "UPDATE_STATUS_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      status: t.String(),
      comment: t.Optional(t.String()),
    }),
  })

  // 5. PUT /api/tasks/:id - Update full task details
  .put("/:id", async ({ params, body, set }) => {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (body.title) updateData.title = body.title.trim();
      if (body.description !== undefined) updateData.description = body.description?.trim() || null;
      if (body.moduleTag) updateData.moduleTag = body.moduleTag;
      if (body.assignedTo) updateData.assignedTo = body.assignedTo;
      if (body.dueDate) updateData.dueDate = new Date(body.dueDate);

      const [updated] = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, params.id))
        .returning();

      if (!updated) {
        set.status = 404;
        return { error: "Task not found" };
      }

      // Record update activity
      try {
        await db.insert(taskActivities).values({
          id: `act-${crypto.randomUUID().slice(0, 8)}`,
          taskId: params.id,
          userId: "user-rey-superadmin",
          action: "TASK_UPDATED",
          comment: "Task parameters updated",
        });
      } catch (actErr) {
        console.warn("[Asterisk Task Activity Warning]:", actErr);
      }

      return {
        ...updated,
        dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err: any) {
      set.status = 500;
      return { error: "UPDATE_TASK_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      title: t.Optional(t.String()),
      description: t.Optional(t.String()),
      moduleTag: t.Optional(t.String()),
      assignedTo: t.Optional(t.String()),
      dueDate: t.Optional(t.String()),
    }),
  })

  // 6. DELETE /api/tasks/:id - Delete a task
  .delete("/:id", async ({ params, set }) => {
    try {
      await db.delete(tasks).where(eq(tasks.id, params.id));
      return { success: true, deletedId: params.id };
    } catch (err: any) {
      set.status = 500;
      return { error: "DELETE_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })

  // 7. GET /api/tasks/:id/activities - List activities for a task
  .get("/:id/activities", async ({ params, set }) => {
    try {
      const activities = await db
        .select()
        .from(taskActivities)
        .where(eq(taskActivities.taskId, params.id))
        .orderBy(desc(taskActivities.createdAt));

      const allUsers = await db.select().from(users);

      return activities.map((a) => {
        const u = allUsers.find((user) => user.id === a.userId);
        return {
          ...a,
          userFullName: u?.fullName ?? "Rey Cannavaro",
          createdAt: a.createdAt ? a.createdAt.toISOString() : new Date().toISOString(),
        };
      });
    } catch (err: any) {
      set.status = 500;
      return { error: "FETCH_ACTIVITIES_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })

  // 8. POST /api/tasks/:id/activities - Post comment/note to task timeline
  .post("/:id/activities", async ({ params, body, set }) => {
    try {
      const activityId = `act-${crypto.randomUUID().slice(0, 8)}`;
      const newAct = {
        id: activityId,
        taskId: params.id,
        userId: "user-rey-superadmin",
        action: "COMMENT_ADDED",
        comment: body.comment.trim(),
      };

      const [inserted] = await db.insert(taskActivities).values(newAct).returning();
      set.status = 201;
      return {
        ...inserted,
        userFullName: "Rey Cannavaro",
        createdAt: inserted.createdAt.toISOString(),
      };
    } catch (err: any) {
      set.status = 500;
      return { error: "POST_ACTIVITY_FAILED", message: err.message };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      comment: t.String({ minLength: 1 }),
    }),
  });
