import { GeneratedSchema } from "../rules.types.js";

export const durationGenSchema = (name: string): GeneratedSchema<"duration"> => ({
    kind: "duration",
    code: `durationSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "durationSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
