import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUIDv7 } from "bun";
import { users } from "./users";

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
