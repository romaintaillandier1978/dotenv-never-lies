import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const cookieParserPreset: InferPreset = {
    origin: "cookie-parser",
    presets: {
        COOKIE_SECRET: {
            description: "Cookie secret",
            schema: z.string().min(16),
            secret: true,
            examples: ["a-very-long-random-secret"],
            kind: "string",
            code: "z.string().min(16)",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};