export interface Env {
    /**
     * Runtime environment
     */
    NODE_ENV: "test" | "development" | "staging" | "production";
    /**
     * API port
     */
    NODE_PORT?: number;
    /**
     * JWT Secret
     */
    JWT_SECRET: string;
    /**
     * URL of site A
     */
    FRONT_A: string;
    /**
     * URL of site B
     */
    FRONT_B: string;
    /**
     * URL of site C
     */
    FRONT_C: string;
    /**
     * the front-end URLs allowed to make requests to this API, separated by semicolons
     */
    NODE_CORS_ORIGIN: string[];
}
