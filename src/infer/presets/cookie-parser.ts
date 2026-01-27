import { z } from "zod";
import { PressetDef } from "../presets.types.js";

export const cookieParserPreset: PressetDef = {
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
