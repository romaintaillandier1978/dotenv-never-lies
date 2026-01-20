import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const jsonwebtoken : InferPreset = {   
    origin : "jsonwebtoken",
    presets : {
        JWT_SECRET: {
            description: "JWT Secret",
            schema: z.string(),
            secret: true,
            examples: ["1234567890-secret-key"],
            kind: "string",
            code: "z.string()",
            imports: [],
        },
    },
};