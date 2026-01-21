import { z } from "zod";
import { InferPreset } from "../presets.types.js";
import { booleanSchema } from "../../schemas/boolean.js";

export const expressSessionPreset: InferPreset = {
    origin: "express-session",
    presets: {
        SESSION_SECRET: {
            description: "Session secret used to sign the session ID cookie",
            schema: z.string().min(16),
            secret: true,
            examples: ["a-very-long-random-secret"],
            kind: "string",
            code: "z.string().min(16)",
            imports: [{ name: "z", from: "zod" }],
        },
        SESSION_NAME: {
            description: "Session cookie name",
            schema: z.string().optional(),
            examples: ["connect.sid"],
            kind: "string",
            code: "z.string().optional()",
            imports: [{ name: "z", from: "zod" }],
        },
        SESSION_COOKIE_SECURE: {
            description: "Whether the session cookie should be marked as secure",
            schema: booleanSchema("SESSION_COOKIE_SECURE").optional(),
            examples: ["true"],
            kind: "boolean",
            code: "booleanSchema(\"SESSION_COOKIE_SECURE\").optional()",
            imports: [{ name: "booleanSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
        SESSION_COOKIE_DOMAIN: {
            description: "Domain scope for the session cookie",
            schema: z.string().optional(),
            examples: [".example.com"],
            kind: "string",
            code: "z.string().optional()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};