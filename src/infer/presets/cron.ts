import { booleanSchema } from "../../schemas/boolean.js";
import { InferPreset } from "../presets.types.js";
import { z } from "zod";

export const cronPreset: InferPreset = {
    origin: "cron",
    presets: {
        CRON_ENABLED: {
            description: "Whether cron is enabled",
            schema: booleanSchema("CRON_ENABLED"),
            kind: "boolean",
            code: "booleanSchema(\"CRON_ENABLED\")",
            imports: [{ name: "booleanSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
        CRON_TZ: {
            description: "Cron timezone",
            examples: ["Europe/Paris"],
            schema: z.string(),
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};