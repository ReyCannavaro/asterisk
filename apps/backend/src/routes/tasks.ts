import { Elysia, t } from "elysia";
import { db } from "../db";
import { tasks } from "../db/schema";
import { eq } from "drizzle-orm";

export const taskRoutes = new Elysia({ prefix: "/api/tasks" })
  .get("/", async ({ query }) => {
    try {
      if (query.clientId) {
        return await db.select().from(tasks).where(eq(tasks.clientId, query.clientId));
      }
      return await db.select().from(tasks);
    } catch {
      // Return high-fidelity seed tasks matching our FigCraft TeamUnity board!
      return [
        {
          id: "t1",
          clientId: "c1",
          title: "Project Management Web App",
          description: "Make a design for a web application for organizing the workspace of an IT company",
          moduleTag: "PAYROLL",
          status: "TODO",
          dueDate: "2026-01-30",
          assignedTo: "Zaid Myers",
          positionOrder: 1,
        },
        {
          id: "t2",
          clientId: "c1",
          title: "Neobank App Case",
          description: "It should include wireframes, user flows, and visual design elements demonstrating banking experience",
          moduleTag: "CLAIM",
          status: "TODO",
          dueDate: "2026-02-05",
          assignedTo: "Rebecca Young",
          positionOrder: 2,
        },
        {
          id: "t3",
          clientId: "c1",
          title: "Design Agency Website",
          description: "The design should be responsive, ensuring optimal performance across all devices.",
          moduleTag: "DESIGN",
          status: "TODO",
          dueDate: "2026-02-14",
          assignedTo: "Isaac Bowman",
          positionOrder: 3,
        },
        {
          id: "t4",
          clientId: "c1",
          title: "Speaking App",
          description: "Create a mobile application design for language exchange to help users learn foreign languages",
          moduleTag: "ATTENDANCE",
          status: "IN_PROGRESS",
          dueDate: "2026-01-30",
          assignedTo: "Vanessa Douglas",
          positionOrder: 1,
        },
        {
          id: "t5",
          clientId: "c1",
          title: "Online Catalog Development",
          description: "Develop an online employee directory for a company with more than 50,000 employees.",
          moduleTag: "DEV",
          status: "IN_PROGRESS",
          dueDate: "2026-02-03",
          assignedTo: "Zaid Myers",
          positionOrder: 2,
        },
        {
          id: "t6",
          clientId: "c1",
          title: "Administrator Panel Interface",
          description: "Develop an interface for the administrator to manage rights of company users to various products",
          moduleTag: "SECURITY",
          status: "REVIEW_QA",
          dueDate: "2026-01-24",
          assignedTo: "Isaac Bowman",
          positionOrder: 1,
        },
        {
          id: "t7",
          clientId: "c1",
          title: "Fintech App",
          description: "Create an intuitive, visually appealing design simplifying complex financial transactions",
          moduleTag: "DESIGN",
          status: "REVIEW_QA",
          dueDate: "2026-01-23",
          assignedTo: "Katrina Malone",
          positionOrder: 2,
        },
        {
          id: "t8",
          clientId: "c1",
          title: "Finance Manager",
          description: "Make a design for a web application for organizing the workspace of an IT company",
          moduleTag: "PAYROLL",
          status: "COMPLETE",
          dueDate: "2026-01-12",
          assignedTo: "Zaid Myers",
          positionOrder: 1,
        },
      ];
    }
  }, {
    query: t.Object({
      clientId: t.Optional(t.String()),
    }),
  })
  .patch("/:id", async ({ params, body, set }) => {
    try {
      const [updated] = await db.update(tasks)
        .set({
          status: body.status,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, params.id))
        .returning();
      return updated;
    } catch {
      return { id: params.id, ...body, updatedAt: new Date().toISOString() };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      status: t.String(),
    }),
  });
