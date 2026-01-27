import { z } from "zod";
import { PressetDef } from "../presets.types.js";

export const awsSdkPreset: PressetDef = {
    origin: "aws-sdk",
    presets: {
        AWS_ACCESS_KEY_ID: {
            description: "AWS access key ID",
            schema: z.string(),
            secret: true,
            examples: ["AKIAIOSFODNN7EXAMPLE"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        AWS_SECRET_ACCESS_KEY: {
            description: "AWS secret access key",
            schema: z.string(),
            secret: true,
            examples: ["wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        AWS_REGION: {
            description: "AWS region",
            schema: z.string(),
            secret: false,
            examples: ["eu-west-1"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
