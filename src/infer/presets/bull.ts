import { z } from "zod";
import { InferPreset } from "../presets.types.js";
import { portSchema } from "../../schemas/port.js";
import { queueUrlSchema } from "../../schemas/urls.js";

export const bullPreset: InferPreset = {
    origin: "bull",
    presets: {
        REDIS_URL: {
            description: "Redis connection URL",
            schema: queueUrlSchema("REDIS_URL"),
            secret: true,
            examples: ["redis://localhost:6379"],
            kind: "url",
            code: "queueUrlSchema(\"REDIS_URL\")",
            imports: [{ name: "queueUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },

        REDIS_HOST: {
            description: "Redis host",
            schema: z.string(),
            secret: false,
            examples: ["localhost"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },

        REDIS_PORT: {
            description: "Redis port",
            schema: portSchema("REDIS_PORT"),
            secret: false,
            examples: ["6379"],
            kind: "port",
            code: "portSchema(\"REDIS_PORT\")",
            imports: [{ name: "portSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },

        REDIS_PASSWORD: {
            description: "Redis password",
            schema: z.string(),
            secret: true,
            examples: ["redis-password"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },

        REDIS_USERNAME: {
            description: "Redis username (ACL)",
            schema: z.string(),
            secret: false,
            examples: ["default"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },

        REDIS_DB: {
            description: "Redis database index",
            schema: z.coerce.number().int().min(0),
            secret: false,
            examples: ["0"],
            kind: "number",
            code: "z.coerce.number().int().min(0)",
            imports: [{ name: "z", from: "zod" }],
        },

        REDIS_TLS: {
            description: "Enable TLS for Redis connection",
            schema: z.coerce.boolean(),
            secret: false,
            examples: ["true"],
            kind: "boolean",
            code: "z.coerce.boolean()",
            imports: [{ name: "z", from: "zod" }],
        },

        REDIS_CA_CERT: {
            description: "CA certificate for Redis TLS connection",
            schema: z.string(),
            secret: true,
            examples: ["/secrets/redis-ca.pem"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },

        REDIS_CLIENT_CERT: {
            description: "Client certificate for Redis TLS connection",
            schema: z.string(),
            secret: true,
            examples: ["/secrets/redis-client.pem"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },

        REDIS_CLIENT_KEY: {
            description: "Client private key for Redis TLS connection",
            schema: z.string(),
            secret: true,
            examples: ["/secrets/redis-client.key"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },

        REDIS_PREFIX: {
            description: "Key prefix used by Bull queues",
            schema: z.string(),
            secret: false,
            examples: ["bull"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },

        REDIS_CONNECT_TIMEOUT: {
            description: "Redis connection timeout in milliseconds",
            schema: z.coerce.number().int().min(0),
            secret: false,
            examples: ["10000"],
            kind: "number",
            code: "z.coerce.number().int().min(0)",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};