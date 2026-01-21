

import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const passportJwtPreset: InferPreset = {
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