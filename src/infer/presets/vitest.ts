import { InferPreset } from "../presets.types.js";
import { booleanSchema } from "../../schemas/boolean.js";

export const vitestPreset: InferPreset = {
    origin: "vitest",
    presets: {
        VITEST: {
            description: "Defined when running under Vitest",
            schema: booleanSchema("VITEST"),
            kind: "boolean",
            code: "booleanSchema(\"VITEST\")",
            imports: [{ name: "booleanSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
    },
};