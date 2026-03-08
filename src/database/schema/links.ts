import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUIDv7 } from "bun";
import { users } from "./users";
import { folders } from "./folders";
import { workspaces } from "./workspaces";

export const links = pgTable("links", {
  id: text("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  title: text("title").notNull(),
  url: text("url").notNull(),
  folderId: text("folder_id").references(() => folders.id, { onDelete: "set null" }),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
