import { z } from "zod";
import { PressetDef } from "../presets.types.js";

export const passportPreset: PressetDef = {
    origin: "passport",
    presets: {
        SESSION_SECRET: {
            description: "Session secret used to sign cookies",
            schema: z.string(),
            secret: true,
            examples: ["super-long-session-secret"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
