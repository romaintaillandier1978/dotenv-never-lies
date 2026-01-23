import envDefinition from "../env.dnl.js";
type RuntimeEnv = ReturnType<typeof envDefinition.assert>;
export interface Env {
    /**
     * Node.js runtime environment
     * @env NODE_ENV
     */
    NODE_ENV?: RuntimeEnv["NODE_ENV"];
    /**
     * The username for the PostgreSQL user. It SHOULD have Admin role !

Please ask John (john.doe@somewhere.com) to get one.
     * @env POSTGRES_USER
     * @required
     */
    POSTGRES_USER: RuntimeEnv["POSTGRES_USER"];
    /**
     * The password for the PostgreSQL user.

Please ask John (john.doe@somewhere.com) to get one.
     * @env POSTGRES_PASSWORD
     * @secret
     * @required
     */
    POSTGRES_PASSWORD: RuntimeEnv["POSTGRES_PASSWORD"];
}
