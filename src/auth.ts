import  {betterAuth} from "better-auth"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import {openAPI  } from "better-auth/plugins"
import {db} from "@/database/client"
export const auth = betterAuth({
    basePath: "/auth",
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            accessType: "offline",
        },
    },
    plugins: [
        openAPI()
        
    ],
    database: drizzleAdapter(
    db, {
        provider: "pg",
        usePlural: true,

    }),
    trustedOrigins: ["http://localhost:3333", "http://localhost:3000"],
    advanced: {
        database: {
            generateId: false // Desativa a geração automática de IDs
        }
    },
    emailAndPassword:{
        enabled: true, // Habilita autenticação por email e senha
        autoSignIn: true,//autentica o usuário automaticamente após o cadastro
        password: {
            hash: (password: string) => Bun.password.hash(password), // Função para hashear a senha
            verify: ({password, hash }) => Bun.password.verify(password, hash), // Função para verificar a senha
        }
    } ,
    session: {
      expiresIn: 60 * 60 * 24 * 7, // Sessão expira em 7 dias
      cookieCache: {
        maxAge: 60 * 60 * 24 * 7, // Cookie expira em 7 dias
        enabled: true, // Habilita cache de cookies
      }
    }
})