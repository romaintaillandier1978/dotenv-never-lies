import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const multerPreset: InferPreset = {
    origin: "multer",
    presets: {
        UPLOAD_DIR: {
            description: "Directory where uploaded files are stored",
            schema: z.string(),
            secret: false,
            examples: ["./uploads"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
