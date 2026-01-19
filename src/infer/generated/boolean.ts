import { GeneratedSchema } from "../rules.types.js";

export const boolGenSchema = (name: string): GeneratedSchema<"boolean"> => ({
    kind: "boolean",
    code: `booleanSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "booleanSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
