import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { openAPI , oAuthProxy} from "better-auth/plugins"
import { db } from "@/database/client"
export const auth = betterAuth({
    basePath: "/auth",
    baseURL: process.env.BETTER_AUTH_URL?.replace(/\/$/, ''),
    secret: process.env.BETTER_AUTH_SECRET,
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            accessType: "offline",
        },
    },
    plugins: [
        openAPI(),
        oAuthProxy({ productionURL: 'https://lynex-api-production.up.railway.app' }),
    ],
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        transaction: true,
    }),
    trustedOrigins: [
        "http://localhost:3333",
        "http://localhost:3000",
        "https://lynex-cli.vercel.app",
        "https://lynex-cli-production.up.railway.app",
        "https://lynex-api-production.up.railway.app",
    ],
    advanced: {
        crossSubDomainCookies: {
            enabled: false,
        },
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
        },
        database: {
            generateId: false,
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        password: {
            hash: (password: string) => Bun.password.hash(password),
            verify: ({ password, hash }) => Bun.password.verify(password, hash),
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        cookieCache: {
            maxAge: 60 * 60 * 24 * 7,
            enabled: true,
        },
    },
})