import { GeneratedSchema } from "../types.js";

export const keyValueSchemaGen = (name: string, splitter: string, of?: GeneratedSchema): GeneratedSchema<"keyValue"> => ({
    kind: "keyValue",
    code: `keyValueSchema(${JSON.stringify(name)}, { splitter: "${splitter}"${of ? `, of: ${of.code}` : ""} })`,
    imports: [
        {
            name: "keyValueSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});

export const keyValueSchemaGenNoName = keyValueSchemaGen("", "=");
