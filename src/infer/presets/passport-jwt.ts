import { z } from "zod";
import { PressetDef } from "../presets.types.js";

export const passportJwtPreset: PressetDef = {
    origin: "passport-jwt",
    presets: {
        JWT_SECRET: {
            description: "JWT signing secret",
            schema: z.string(),
            secret: true,
            examples: ["super-long-random-jwt-secret"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
