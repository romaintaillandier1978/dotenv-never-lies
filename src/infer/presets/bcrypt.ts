

import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const bcryptPreset: InferPreset = {
    origin: "bcrypt",
    presets: {
        BCRYPT_SALT_ROUNDS: {
            description: "Number of salt rounds used to hash passwords",
            schema: z.coerce.number().int().min(8).max(20),
            secret: false,
            examples: ["10"],
            kind: "number",
            code: "z.coerce.number().int().min(8).max(20)",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};