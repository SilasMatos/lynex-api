import { accounts } from "./accounts";
import { sessions } from "./sessions";
import { users } from "./users";
import { verifications } from "./verifications";

export const schema = {
  users, 
  accounts,
  sessions,
  verifications
}
  // Define your database schema here using Drizzle ORM's schema definition methods