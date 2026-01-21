import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const stripePreset: InferPreset = {
    origin: "stripe",
    presets: {
        STRIPE_SECRET_KEY: {
            description: "Stripe secret API key",
            schema: z.string().startsWith("sk_"),
            secret: true,
            examples: ["sk_test_1234567890"],
            kind: "string",
            code: "z.string().startsWith(\"sk_\")",
            imports: [{ name: "z", from: "zod" }],
        },
        STRIPE_WEBHOOK_SECRET: {
            description: "Stripe webhook signing secret",
            schema: z.string().startsWith("whsec_"),
            secret: true,
            examples: ["whsec_1234567890"],
            kind: "string",
            code: "z.string().startsWith(\"whsec_\")",
            imports: [{ name: "z", from: "zod" }],
        },
        STRIPE_TAX_RATE_20_EXCL_ID: {
            description: "Stripe tax rate 20% exclusive ID",
            schema: z.string().min(1),
            secret: true,
            examples: ["txr_1234567890"],
            kind: "string",
            code: "z.string().min(1)",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};