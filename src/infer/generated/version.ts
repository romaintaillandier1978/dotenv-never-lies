import { GeneratedSchema } from "../rules.types.js";

export const versionGenSchema = (name: string): GeneratedSchema<"version"> => ({
    kind: "version",
    code: `versionSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "versionSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
export const versionGenSchemaNoName = versionGenSchema("");
