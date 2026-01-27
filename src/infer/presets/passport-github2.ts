import { z } from "zod";
import { PressetDef } from "../presets.types.js";

export const passportGithubPreset: PressetDef = {
    origin: "passport-github2",
    presets: {
        GITHUB_CLIENT_ID: {
            description: "GitHub OAuth client ID",
            schema: z.string(),
            secret: false,
            examples: ["Iv1.1234567890abcdef"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        GITHUB_CLIENT_SECRET: {
            description: "GitHub OAuth client secret",
            schema: z.string(),
            secret: true,
            examples: ["xxxxxxxxxxxxxxxxxxxx"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
