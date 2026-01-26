import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const newrelicPreset: InferPreset = {
    origin: "newrelic",
    presets: {
        NEW_RELIC_LICENSE_KEY: {
            description: "New Relic license key",
            schema: z.string(),
            secret: true,
            examples: ["xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
