import { portSchema } from "../../schemas/port.js";
import { InferPreset } from "../presets.types.js";
import { z } from "zod";

export const nodePreset: InferPreset = {
    origin: "node",
    presets: {
        NODE_ENV: {
            description: "Node.js runtime environment",
            schema: z.enum(["development", "production", "test"]),
            examples: ["development"],
            kind: "enum",
            code: "z.enum([\"development\", \"production\", \"test\"])",
            imports: [{ name: "z", from: "zod" }],
        },
        PORT: {
            description: "Node.js port",
            schema: portSchema("PORT").default(3000),
            examples: ["3000"],
            kind: "port",
            code: "portSchema(\"PORT\").default(3000)",
            imports: [{ name: "portSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
        HOST: {
            description: "Node.js host",
            schema: z.string(),
            examples: ["0.0.0.0", "localhost", "domain.com"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        TZ: {
            description: "Node.js timezone",
            schema: z.string().default("UTC"),
            examples: ["UTC"],
            kind: "string",
            code: "z.string().default(\"UTC\")",
            imports: [{ name: "z", from: "zod" }],
        }
    },
};