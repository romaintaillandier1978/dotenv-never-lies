import { InferPreset } from "../presets.types.js";
import { databaseUrlSchema } from "../../schemas/urls.js";

export const mongoosePreset: InferPreset = {
    origin: "mongoose",
    presets: {
        MONGODB_URI: {
            description: "MongoDB connection URI",
            schema: databaseUrlSchema("MONGODB_URI"),
            secret: true,
            examples: ["mongodb://user:password@localhost:27017/db"],
            kind: "url",
            code: 'databaseUrlSchema("MONGODB_URI")',
            imports: [{ name: "databaseUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
    },
};
