import { InferPreset } from "../presets.types.js";
import { queueUrlSchema } from "../../schemas/urls.js";

export const amqplibPreset: InferPreset = {
    origin: "amqplib",
    presets: {
        RABBITMQ_URL: {
            description: "RabbitMQ connection URL",
            schema: queueUrlSchema("RABBITMQ_URL"),
            secret: true,
            examples: ["amqp://user:password@localhost:5672"],
            kind: "string",
            code: 'queueUrlSchema("RABBITMQ_URL")',
            imports: [{ name: "queueUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
        },
    },
};
