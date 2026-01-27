import { GeneratedSchema } from "../infer.types.js";

export const jsonGenSchema = (name: string, of?: GeneratedSchema): GeneratedSchema<"json"> => ({
    kind: "json",
    code: `jsonSchema(${JSON.stringify(name)}${of ? `, ${of.code}` : ""})`,
    imports: [
        {
            name: "jsonSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const jsonGenSchemaNoName = jsonGenSchema("");
