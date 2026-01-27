import { GeneratedSchema } from "../infer.types.js";

export const httpUrlGenSchema = (name: string): GeneratedSchema<"url"> => ({
    kind: "url",
    code: `httpUrlSchema(${JSON.stringify(name)})`,
    imports: [{ name: "httpUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
});

export const httpUrlGenSchemaNoName = httpUrlGenSchema("");

export const databaseUrlGenSchema = (name: string): GeneratedSchema<"url"> => ({
    kind: "url",
    code: `databaseUrlSchema(${JSON.stringify(name)})`,
    imports: [{ name: "databaseUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
});

export const databaseUrlGenSchemaNoName = databaseUrlGenSchema("");

export const queueUrlGenSchema = (name: string): GeneratedSchema<"url"> => ({
    kind: "url",
    code: `queueUrlSchema(${JSON.stringify(name)})`,
    imports: [{ name: "queueUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
});

export const queueUrlGenSchemaNoName = queueUrlGenSchema("");

export const wsUrlSchemaGen = (name: string): GeneratedSchema<"url"> => ({
    kind: "url",
    code: `wsUrlSchema(${JSON.stringify(name)})`,
    imports: [{ name: "wsUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
});

export const wsUrlGenSchemaNoName = wsUrlSchemaGen("");

export const storageUrlGenSchema = (name: string): GeneratedSchema<"url"> => ({
    kind: "url",
    code: `storageUrlSchema(${JSON.stringify(name)})`,
    imports: [{ name: "storageUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
});

export const storageUrlGenSchemaNoName = storageUrlGenSchema("");

export const otherUrlGenSchema = (name: string): GeneratedSchema<"url"> => ({
    kind: "url",
    code: `otherUrlSchema(${JSON.stringify(name)})`,
    imports: [{ name: "otherUrlSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
});

export const otherUrlGenSchemaNoName = otherUrlGenSchema("");
