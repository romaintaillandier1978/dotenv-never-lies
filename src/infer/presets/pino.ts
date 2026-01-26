import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const pinoPreset: InferPreset = {
    origin: "pino",
    presets: {
        LOG_LEVEL: {
            description: "Logging level",
            schema: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
            secret: false,
            examples: ["info"],
            kind: "enum",
            code: 'z.enum(["fatal", "error", "warn", "info", "debug", "trace"])',
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
