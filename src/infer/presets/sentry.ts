import { InferPreset } from "../presets.types.js";
import { httpUrlSchema } from "../../schemas/urls.js";

export const sentryPreset: InferPreset = {
    origin: "@sentry/node",
    presets: {
        SENTRY_DSN: {
            description: "Sentry DSN",
            schema: httpUrlSchema("SENTRY_DSN"),
            secret: true,
            examples: ["https://key@o123.ingest.sentry.io/456"],
            kind: "url",
            code: 'httpUrlSchema("SENTRY_DSN")',
            imports: [{ name: "httpUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
    },
};
