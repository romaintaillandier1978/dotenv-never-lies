import { GeneratedSchema } from "../types.js";

export const listSchemaGen = (name: string, splitter: string, of: GeneratedSchema): GeneratedSchema => ({
    code: `listSchema(${JSON.stringify(name)}, { splitter: "${splitter}" ${of ? `, of: ${of.code}` : ""} })`,
    imports: [
        {
            name: "listSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
        ...of.imports,
    ],
});

export const keyValueListSchemaGen = (name: string, splitter: string, of: GeneratedSchema): GeneratedSchema => ({
    code: `keyValueListSchema(${JSON.stringify(name)}, { splitter: "${splitter}" ${of ? `, of: ${of.code}` : ""} })`,
    imports: [
        {
            name: "keyValueListSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const urlListSchemaGen = (name: string, splitter: string): GeneratedSchema => ({
    code: `urlListSchema(${JSON.stringify(name)}, { splitter: "${splitter}" })`,
    imports: [
        {
            name: "urlListSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const emailListSchemaGen = (name: string, splitter: string): GeneratedSchema => ({
    code: `emailListSchema(${JSON.stringify(name)}, { splitter: "${splitter}" })`,
    imports: [
        {
            name: "emailListSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
// TODO WRONG ! options: SplitterSchemaOptions<T> = {}
export const listOfSchemaGen = (name: string, splitter: string, of: GeneratedSchema): GeneratedSchema => ({
    code: `listSchema(${JSON.stringify(name)}, { splitter: "${splitter}", of: ${of.code} })`,
    imports: [{ name: "listSchema", from: "@romaintaillandier1978/dotenv-never-lies" }, ...of.imports],
});
