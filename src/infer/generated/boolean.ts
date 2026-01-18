import { GeneratedSchema } from "../types.js";

export const boolGenSchema = (name: string): GeneratedSchema => ({
    kind: "boolean",
    code: `booleanSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "booleanSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
