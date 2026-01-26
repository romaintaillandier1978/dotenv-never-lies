import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const stripePreset: InferPreset = {
    origin: "stripe",
    presets: {
        STRIPE_SECRET_KEY: {
            description: "Stripe secret API key ( starts with 'sk_')",
            schema: z.string(),
            secret: true,
            examples: ["sk_test_1234567890"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        STRIPE_WEBHOOK_SECRET: {
            description: "Stripe webhook signing secret ( starts with 'whsec_')",
            schema: z.string(),
            secret: true,
            examples: ["whsec_1234567890"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        STRIPE_TAX_RATE_20_EXCL_ID: {
            description: "Stripe tax rate 20% exclusive ID ( starts with 'txr_')",
            schema: z.string(),
            secret: true,
            examples: ["txr_1234567890"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
