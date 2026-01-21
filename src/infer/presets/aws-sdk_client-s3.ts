

import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const awsSdkS3Preset: InferPreset = {
    origin: "@aws-sdk/client-s3",
    presets: {
        AWS_S3_BUCKET: {
            description: "Default S3 bucket name",
            schema: z.string(),
            secret: false,
            examples: ["my-app-bucket"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};