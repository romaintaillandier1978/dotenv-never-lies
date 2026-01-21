import { z } from "zod";
import { InferPreset } from "../presets.types.js";
import { durationSchema } from "../../schemas/duration.js";

export const jsonwebtokenPreset: InferPreset = {
    origin: "jsonwebtoken",
    presets: {
        JWT_SECRET: {
            description: "JWT signing secret",
            schema: z.string(),
            secret: true,
            examples: ["super-long-random-jwt-secret"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        JWT_EXPIRES_IN: {
            description: "JWT expires in",
            schema: durationSchema("JWT_EXPIRES_IN"),
            examples: ["1h"],
            kind: "duration",
            code: "durationSchema(\"JWT_EXPIRES_IN\")",
            imports: [{ name: "durationSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
        JWT_ISSUER: {
            description: "JWT issuer",
            schema: z.string(),
            examples: ["https://example.com"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        JWT_AUDIENCE: {
            description: "JWT audience",
            schema: z.string(),
            examples: ["https://example.com"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};