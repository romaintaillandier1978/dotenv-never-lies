import { GeneratedSchema } from "../types.js";

export const jsonGenSchema = (name: string): GeneratedSchema => ({
    code: `jsonSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "jsonSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const jsonGenSchemaNoName = jsonGenSchema("");
