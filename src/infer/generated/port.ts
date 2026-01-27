import { GeneratedSchema } from "../infer.types.js";

export const portGenSchema = (name: string): GeneratedSchema<"port"> => ({
    kind: "port",
    code: `portSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "portSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const portGenSchemaNoName = portGenSchema("");
