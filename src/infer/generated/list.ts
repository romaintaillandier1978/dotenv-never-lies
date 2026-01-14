import { GeneratedSchema } from "../types.js";

export const listSchemaGen = (name: string): GeneratedSchema => ({
    code: `listSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "listSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const keyValueSchemaGen = (name: string): GeneratedSchema => ({
    code: `keyValueSchema("${JSON.stringify(name)}")`,
    imports: [
        {
            name: "keyValueSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
export const keyValueListSchemaGen = (name: string): GeneratedSchema => ({
    code: `keyValueListSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "keyValueListSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const urlListSchemaGen = (name: string): GeneratedSchema => ({
    code: `urlListSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "urlListSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const emailListSchemaGen = (name: string): GeneratedSchema => ({
    code: `emailListSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "emailListSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const listOfSchemaGen = (name: string, of: GeneratedSchema): GeneratedSchema => ({
    code: `listSchema(${JSON.stringify(name)}, { of: ${of.code} })`,
    imports: [{ name: "listSchema", from: "@romaintaillandier1978/dotenv-never-lies" }, ...of.imports],
});
