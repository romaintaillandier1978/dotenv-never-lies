export interface Env {
    /**
     * @env NODE_ENV
     * @required
     * Runtime environment
     */
    NODE_ENV: "test" | "development" | "staging" | "production";
    /**
     * @env NODE_PORT
     * API port
     */
    NODE_PORT?: number;
    /**
     * @env JWT_SECRET
     * @secret
     * @required
     * JWT Secret
     */
    JWT_SECRET: string;
    /**
     * @env FRONT_A
     * @required
     * URL of site A
     */
    FRONT_A: string;
    /**
     * @env FRONT_B
     * @required
     * URL of site B
     */
    FRONT_B: string;
    /**
     * @env FRONT_C
     * @required
     * URL of site C
     */
    FRONT_C: string;
    /**
     * @env NODE_CORS_ORIGIN
     * @required
     * the front-end URLs allowed to make requests to this API, separated by semicolons
     *
     * ⚠️ TRANSFORMED ENV VARIABLE
     *
     * Runtime type differs from declared type.
     * Do NOT trust this type without checking the schema.
     *
     * @dnl-transform
     */
    NODE_CORS_ORIGIN: string;
}
