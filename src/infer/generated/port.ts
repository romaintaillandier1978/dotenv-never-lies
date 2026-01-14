import { GeneratedSchema } from "../types.js";

export const portGenSchema = (name: string): GeneratedSchema => ({
    code: `portSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "portSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const portGenSchemaNoName = portGenSchema("");
