import envDefinition from "../env.dnl.js";
type RuntimeEnv = ReturnType<typeof envDefinition.assert>;
export interface Env {
    /**
     * TODO
     * @env NODE_ENV
     * @required
     */
    NODE_ENV: RuntimeEnv["NODE_ENV"];
    /**
     * TODO
     * @env some-bad-database-url
     * @required
     */
    "some-bad-database-url": RuntimeEnv["some-bad-database-url"];
    /**
     * TODO
     * @env JWT_SECRET
     * @secret
     * @required
     */
    JWT_SECRET: RuntimeEnv["JWT_SECRET"];
    /**
     * TODO
     * @env VITEST
     * @required
     */
    VITEST: RuntimeEnv["VITEST"];
    /**
     * TODO
     * @env POSTGRES_DB
     * @required
     */
    POSTGRES_DB: RuntimeEnv["POSTGRES_DB"];
    /**
     * Database URL for Prisma (prisma) - OR - URL to the database (typeorm)
     * @env DATABASE_URL
     * @secret
     * @required
     */
    DATABASE_URL: RuntimeEnv["DATABASE_URL"];
    /**
     * TODO
     * @env FRONT_INSCRIPTION
     * @required
     */
    FRONT_INSCRIPTION: RuntimeEnv["FRONT_INSCRIPTION"];
    /**
     * TODO
     * @env FRONT_INSCRIPTION_PRO
     * @required
     */
    FRONT_INSCRIPTION_PRO: RuntimeEnv["FRONT_INSCRIPTION_PRO"];
    /**
     * TODO
     * @env NODE_CORS_ORIGIN_SECRET
     * @secret
     * @required
     */
    NODE_CORS_ORIGIN_SECRET: RuntimeEnv["NODE_CORS_ORIGIN_SECRET"];
}
