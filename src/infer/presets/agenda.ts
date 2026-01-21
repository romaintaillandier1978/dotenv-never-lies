

import { InferPreset } from "../presets.types.js";
import { databaseUrlSchema } from "../../schemas/urls.js";

export const agendaPreset: InferPreset = {
    origin: "agenda",
    presets: {
        MONGODB_URI: {
            description: "MongoDB connection URI for Agenda",
            schema: databaseUrlSchema("MONGODB_URI"),
            secret: true,
            examples: ["mongodb://user:password@localhost:27017/agenda"],
            kind: "string",
            code: "databaseUrlSchema(\"MONGODB_URI\")",
            imports: [{ name: "databaseUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
    },
};