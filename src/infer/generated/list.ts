import { GeneratedSchema } from "../infer.types.js";

export const listSchemaGen = (name: string, splitter: string, of: GeneratedSchema): GeneratedSchema<"list"> => ({
    kind: "list",
    code: `listSchema(${JSON.stringify(name)}, { splitter: "${splitter}" ${of ? `, of: ${of.code}` : ""} })`,
    imports: [
        {
            name: "listSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
        ...of.imports,
    ],
});

export const keyValueListSchemaGen = (name: string, splitter: string, of: GeneratedSchema): GeneratedSchema<"keyValue"> => ({
    kind: "keyValue",
    code: `keyValueListSchema(${JSON.stringify(name)}, { splitter: "${splitter}" ${of ? `, of: ${of.code}` : ""} })`,
    imports: [
        {
            name: "keyValueListSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const urlListSchemaGen = (name: string, splitter: string): GeneratedSchema<"url"> => ({
    kind: "url",
    code: `urlListSchema(${JSON.stringify(name)}, { splitter: "${splitter}" })`,
    imports: [
        {
            name: "urlListSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const emailListSchemaGen = (name: string, splitter: string): GeneratedSchema<"email"> => ({
    kind: "email",
    code: `emailListSchema(${JSON.stringify(name)}, { splitter: "${splitter}" })`,
    imports: [
        {
            name: "emailListSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
