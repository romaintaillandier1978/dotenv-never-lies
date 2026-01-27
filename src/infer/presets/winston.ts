import { z } from "zod";
import { PressetDef } from "../presets.types.js";

export const winstonPreset: PressetDef = {
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
