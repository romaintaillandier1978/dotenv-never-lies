import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const googleCloudStoragePreset: InferPreset = {
    origin: "@google-cloud/storage",
    presets: {
        GOOGLE_APPLICATION_CREDENTIALS: {
            description: "Path to Google Cloud service account JSON key",
            schema: z.string(),
            secret: true,
            examples: ["/secrets/gcp-key.json"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
