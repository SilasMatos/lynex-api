import { accounts } from "./accounts";
import { sessions } from "./sessions";
import { users } from "./users";
import { verifications } from "./verifications";
import { folders } from "./folders";
import { links } from "./links";
import { workspaces } from "./workspaces";

export { folders, links, workspaces };

export const schema = {
  users,
  accounts,
  sessions,
  verifications,
  workspaces,
  folders,
  links,
}
  // Define your database schema here using Drizzle ORM's schema definition methods