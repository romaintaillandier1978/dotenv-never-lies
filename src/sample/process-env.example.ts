type DbConfig = {
    url: string;
    db: string;
};

export function loadConfig() {
    const nodeEnv = process.env.NODE_ENV || "development";

    const databaseUrl =
        process.env.DATABASE_URL ??
        process.env["some-bad-database-url"] ??
        (() => {
            throw new Error("No database URL provided");
        })();

    const dbConfig: DbConfig = {
        url: databaseUrl,
        db: process.env.POSTGRES_DB || "default-db",
    };

    const { POSTGRES_PORT = 3000 } = process.env;
    console.log("POSTGRES_PORT:", POSTGRES_PORT);
    const anotherPort = process.env["POSTGRES_PORT"] || "4000";
    console.log("POSTGRES_PORT:", anotherPort);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is required");
    }

    const allEnv = process.env;
    if (allEnv.NODE_ENV === "test") {
        console.log("Running in test mode");
    }

    const key = "NODE_CORS_ORIGIN_SECRET";
    const value = process.env[key];
    if (value) {
        console.log(`${key}: ${value}`);
    }
    const value2 = process.env[key] && process.env.JWT_SECRET;
    if (value2) {
        console.log(`${key}: ${value}`);
    }

    const vitestMode = process.env.VITEST === "true";

    const corsOriginsRaw = process.env.NODE_CORS_ORIGIN_SECRET;
    const corsOrigins = corsOriginsRaw ? corsOriginsRaw.split(";").map((s) => s.trim()) : [];

    return {
        nodeEnv,
        dbConfig,
        jwtSecret,
        vitestMode,
        corsOrigins,
    };
}

// --- side effects / usage ---------------------------------------------

const config = loadConfig();

if (config.nodeEnv === "test") {
    console.log("Running in test mode");
}

if (process.env.POSTGRES_PASSWORD) {
    console.warn("POSTGRES_PASSWORD should not be read directly");
}

console.log("Loaded config:", {
    env: config.nodeEnv,
    db: config.dbConfig.db,
    cors: config.corsOrigins.length,
});
