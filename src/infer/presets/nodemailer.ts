

import { z } from "zod";
import { InferPreset } from "../presets.types.js";
import { portSchema } from "../../schemas/port.js";
import { booleanSchema } from "../../schemas/boolean.js";

export const nodemailerPreset: InferPreset = {
    origin: "nodemailer",
    presets: {
        SMTP_HOST: {
            description: "SMTP server hostname",
            schema: z.string(),
            examples: ["smtp.gmail.com"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        SMTP_PORT: {
            description: "SMTP server port",
            schema: portSchema("SMTP_PORT"),
            examples: ["587"],
            kind: "port",
            code: "portSchema(\"SMTP_PORT\")",
            imports: [{ name: "portSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
        SMTP_USER: {
            description: "SMTP authentication user",
            schema: z.string(),
            secret: true,
            examples: ["user@example.com"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        SMTP_PASS: {
            description: "SMTP authentication password",
            schema: z.string(),
            secret: true,
            examples: ["super-secret-password"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        SMTP_SECURE: {
            description: "Use TLS for SMTP connection",
            schema: booleanSchema("SMTP_SECURE").optional(),
            examples: ["true"],
            kind: "boolean",
            code: "booleanSchema(\"SMTP_SECURE\").optional()",
            imports: [{ name: "booleanSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
    },
};