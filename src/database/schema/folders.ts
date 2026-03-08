import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUIDv7 } from "bun";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const folders = pgTable("folders", {
  id: text("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  name: text("name").notNull(),
  parentId: text("parent_id"),
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
