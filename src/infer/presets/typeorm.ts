import { databaseUrlSchema, portSchema } from "../../schemas/index.js";
import { InferPreset } from "../presets.types.js";
import { z } from "zod";

export const typeormPreset: InferPreset = {
    origin: "typeorm",
    presets: {
        DATABASE_URL: {
            description: "URL to the database",
            schema: databaseUrlSchema("DATABASE_URL"),
            secret: true,
            examples: ["postgresql://user:password@localhost:5432/mydb"],
            kind: "url",
            code: 'databaseUrlSchema("DATABASE_URL")',
            imports: [{ name: "databaseUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
        DB_HOST: {
            description: "Host of the database",
            schema: z.string(),
            examples: ["localhost"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        DB_PORT: {
            description: "Port of the database",
            schema: portSchema("DB_PORT"),
            examples: ["5432"],
            kind: "port",
            code: 'portSchema("DB_PORT")',
            imports: [{ name: "portSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
        DB_USER: {
            description: "User of the database",
            schema: z.string(),
            examples: ["user"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        DB_PASSWORD: {
            description: "Password of the database",
            schema: z.string(),
            secret: true,
            examples: ["password"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        DB_NAME: {
            description: "Name of the database",
            schema: z.string(),
            examples: ["mydb"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
