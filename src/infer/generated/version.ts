import { GeneratedSchema } from "../types.js";

export const versionGenSchema = (name: string): GeneratedSchema => ({
    code: `versionSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "versionSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
export const versionGenSchemaNoName = versionGenSchema("");
