export interface Env {
    /**
     * Environnement d’exécution
     */
    NODE_ENV: "test" | "development" | "staging" | "production";
    /**
     * Port de l’API
     */
    NODE_PORT?: number;
    /**
     * JWT Secret
     */
    JWT_SECRET: string;
    /**
     * l'url de la page de simulation en mode res
     */
    FRONT_SIMULATOR_RES: string;
    /**
     * l'url de la page de simulation en mode thermique
     */
    FRONT_SIMULATOR_RES_THERMIQUE: string;
    /**
     * l'url de la page de simulation en mode pro
     */
    FRONT_SIMULATOR_PRO: string;
    /**
     * l'url de la page de back office
     */
    FRONT_BO?: string | undefined;
    /**
     * les urls des front qui sont autorisés à faire des requêtes à cette API, séparées par des points-virgules
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