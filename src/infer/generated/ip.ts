import { GeneratedSchema } from "../types.js";

export const ipGenSchema = (name: string): GeneratedSchema => ({
    kind: "ip",
    code: `ipSchema(${JSON.stringify(name)})`,
    imports: [
        {
            name: "ipSchema",
            from: "@romaintaillandier1978/dotenv-never-lies",
        },
    ],
});
