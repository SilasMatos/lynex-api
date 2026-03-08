import Elysia, { status as elysiaStatus } from "elysia";
import { z } from "zod";
import { db } from "@/database/client";
import { folders, links, workspaces } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { betterAuthPlugin } from "./better-auth";

const folderSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  parentId: z.string().nullable().optional(),
});

const linkSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  url: z.string().min(1),
  folderId: z.string().nullable().optional(),
});

export const bookmarksPlugin = new Elysia({ name: "bookmarks" })
  .use(betterAuthPlugin)

  // PUT /workspaces/sync � cria ou substitui um workspace com seus folders e links
  .put(
    "/workspaces/sync",
    async ({ body, user }) => {
      const userId = user!.id;

      const result = await db.transaction(async (tx) => {
        let workspaceId: string;

        if (body.id) {
          // Verifica ownership
          const [existing] = await tx
            .select()
            .from(workspaces)
            .where(and(eq(workspaces.id, body.id), eq(workspaces.ownerId, userId)));

          if (!existing) {
            const [created] = await tx
              .insert(workspaces)
              .values({ id: body.id, name: body.name, ownerId: userId })
              .returning();
            workspaceId = created.id;
          } else {
            await tx
              .update(workspaces)
              .set({ name: body.name, updatedAt: new Date() })
              .where(eq(workspaces.id, body.id));
            workspaceId = body.id;
          }
        } else {
          const [created] = await tx
            .insert(workspaces)
            .values({ name: body.name, ownerId: userId })
            .returning();
          workspaceId = created.id;
        }

        // Substitui todos os folders e links do workspace
        await tx.delete(folders).where(eq(folders.workspaceId, workspaceId));
        await tx.delete(links).where(eq(links.workspaceId, workspaceId));

        const insertedFolders = body.folders?.length
          ? await tx
              .insert(folders)
              .values(
                body.folders.map((f) => ({
                  ...(f.id ? { id: f.id } : {}),
                  name: f.name,
                  parentId: f.parentId ?? null,
                  workspaceId,
                  userId,
                }))
              )
              .returning()
          : [];

        const insertedLinks = body.links?.length
          ? await tx
              .insert(links)
              .values(
                body.links.map((l) => ({
                  ...(l.id ? { id: l.id } : {}),
                  title: l.title,
                  url: l.url,
                  folderId: l.folderId ?? null,
                  workspaceId,
                  userId,
                }))
              )
              .returning()
          : [];

        return { workspaceId, folders: insertedFolders, links: insertedLinks };
      });

      return result;
    },
    {
      auth: true,
      detail: {
        summary: "Criar ou sincronizar um workspace com folders e links",
        tags: ["Workspaces"],
      },
      body: z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        folders: z.array(folderSchema).optional(),
        links: z.array(linkSchema).optional(),
      }),
    }
  )

  // GET /workspaces — lista os workspaces do usuario autenticado com folders e links
  .get(
    "/workspaces",
    async ({ user }) => {
      const userId = user!.id;
      const userWorkspaces = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.ownerId, userId));

      return Promise.all(
        userWorkspaces.map(async (ws) => {
          const [workspaceFolders, workspaceLinks] = await Promise.all([
            db.select().from(folders).where(eq(folders.workspaceId, ws.id)),
            db.select().from(links).where(eq(links.workspaceId, ws.id)),
          ]);
          return { ...ws, folders: workspaceFolders, links: workspaceLinks };
        })
      );
    },
    {
      auth: true,
      detail: { summary: "Listar meus workspaces", tags: ["Workspaces"] },
    }
  )

  // GET /workspaces/:id � acesso publico ao workspace (compartilhamento via link)
  .get(
    "/workspaces/:id",
    async ({ params, status }) => {
      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, params.id));

      if (!workspace) return status(404, { message: "Workspace nao encontrado" });

      const [workspaceFolders, workspaceLinks] = await Promise.all([
        db.select().from(folders).where(eq(folders.workspaceId, params.id)),
        db.select().from(links).where(eq(links.workspaceId, params.id)),
      ]);

      return { workspace, folders: workspaceFolders, links: workspaceLinks };
    },
    {
      detail: { summary: "Ver workspace publico por ID (compartilhamento)", tags: ["Workspaces"] },
      params: z.object({ id: z.string() }),
    }
  )

  // DELETE /workspaces/:id � remove o workspace (cascata apaga folders e links)
  .delete(
    "/workspaces/:id",
    async ({ params, user, status }) => {
      const userId = user!.id;

      const [deleted] = await db
        .delete(workspaces)
        .where(and(eq(workspaces.id, params.id), eq(workspaces.ownerId, userId)))
        .returning();

      if (!deleted) return status(404, { message: "Workspace nao encontrado" });
      return { success: true };
    },
    {
      auth: true,
      detail: { summary: "Deletar workspace", tags: ["Workspaces"] },
      params: z.object({ id: z.string() }),
    }
  );
