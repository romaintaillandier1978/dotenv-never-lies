import { databaseUrlSchema } from "../../schemas/urls.js";
import { PressetDef } from "../presets.types.js";

export const prismaPreset: PressetDef = {
    origin: "prisma",
    presets: {
        DATABASE_URL: {
            description: "Database URL for Prisma",
            schema: databaseUrlSchema("DATABASE_URL"),
            secret: true,
            examples: ["postgresql://user:password@localhost:5432/mydb"],
            kind: "url",
            code: 'databaseUrlSchema("DATABASE_URL")',
            imports: [{ name: "databaseUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
        SHADOW_DATABASE_URL: {
            description: "Shadow database URL for Prisma",
            schema: databaseUrlSchema("SHADOW_DATABASE_URL").optional(),
            secret: true,
            examples: ["postgresql://user:password@localhost:5432/myshadowdb"],
            kind: "url",
            code: 'databaseUrlSchema("SHADOW_DATABASE_URL").optional()',
            imports: [{ name: "databaseUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
    },
};
