

import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const dotenvPreset: InferPreset = {
    origin: "dotenv",
    presets: {
        DOTENV_CONFIG_PATH: {
            description: "Custom path to .env file",
            schema: z.string().optional(),
            secret: false,
            examples: [".env.production"],
            kind: "string",
            code: "z.string().optional()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};