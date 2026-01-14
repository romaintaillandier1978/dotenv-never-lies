import { GeneratedSchema } from "../types.js";

export const boolGenSchema = (name: string): GeneratedSchema => ({
    code: `boolSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "boolSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
