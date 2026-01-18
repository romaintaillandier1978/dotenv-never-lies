import { GeneratedSchema } from "../types.js";

export const durationGenSchema = (name: string): GeneratedSchema => ({
    kind: "duration",
    code: `durationSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "durationSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
