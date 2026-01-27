import { PressetDef } from "../presets.types.js";
import { databaseUrlSchema } from "../../schemas/urls.js";

export const mysql2Preset: PressetDef = {
    origin: "mysql2",
    presets: {
        MYSQL_DATABASE_URL: {
            description: "MySQL connection URL",
            schema: databaseUrlSchema("MYSQL_DATABASE_URL"),
            secret: true,
            examples: ["mysql://user:password@localhost:3306/db"],
            kind: "url",
            code: 'databaseUrlSchema("MYSQL_DATABASE_URL")',
            imports: [{ name: "databaseUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
    },
};
