import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Payment providers are not registered here. Development uses Medusa's
// built-in manual provider. A production provider is added only after one
// is chosen, and its secrets stay in environment variables.
// Production must set unique JWT_SECRET and COOKIE_SECRET, and STORE_CORS
// to the live storefront origin. Placeholders like "supersecret" are not safe.
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  }
})
