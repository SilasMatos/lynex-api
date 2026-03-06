import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().startsWith("postgresql://", {
    message: "DATABASE_URL must be a valid Postgres URL"
  }),
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
})

export const env = envSchema.parse(process.env)