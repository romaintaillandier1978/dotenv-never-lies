import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const winstonPreset: InferPreset = {
    origin: "winston",
    presets: {
        LOG_LEVEL: {
            description: "Logging level",
            schema: z.string(),
            secret: false,
            examples: ["info"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
