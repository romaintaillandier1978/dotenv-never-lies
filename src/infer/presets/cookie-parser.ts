import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const cookieParserPreset: InferPreset = {
    origin: "cookie-parser",
    presets: {
        COOKIE_SECRET: {
            description: "Cookie secret",
            schema: z.string(),
            secret: true,
            examples: ["a-very-long-random-secret"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
