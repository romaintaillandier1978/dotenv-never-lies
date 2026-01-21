

import { InferPreset } from "../presets.types.js";
import { queueUrlSchema } from "../../schemas/urls.js";

export const ioredisPreset: InferPreset = {
    origin: "ioredis",
    presets: {
        REDIS_URL: {
            description: "Redis connection URL",
            schema: queueUrlSchema("REDIS_URL"),
            secret: true,
            examples: ["redis://localhost:6379"],
            kind: "url",
            code: "queueUrlSchema(\"REDIS_URL\")",
            imports: [{ name: "queueUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
    },
};