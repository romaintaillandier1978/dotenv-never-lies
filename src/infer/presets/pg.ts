import { InferPreset } from "../presets.types.js";
import { databaseUrlSchema } from "../../schemas/urls.js";

export const pgPreset: InferPreset = {
    origin: "pg",
    presets: {
        DATABASE_URL: {
            description: "PostgreSQL connection URL",
            schema: databaseUrlSchema("DATABASE_URL"),
            secret: true,
            examples: ["postgres://user:password@localhost:5432/db"],
            kind: "url",
            code: 'databaseUrlSchema("DATABASE_URL")',
            imports: [{ name: "databaseUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
    },
};
