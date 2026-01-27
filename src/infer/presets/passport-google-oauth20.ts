import { z } from "zod";
import { PressetDef } from "../presets.types.js";

export const passportGooglePreset: PressetDef = {
    origin: "passport-google-oauth20",
    presets: {
        GOOGLE_CLIENT_ID: {
            description: "Google OAuth client ID",
            schema: z.string(),
            secret: false,
            examples: ["1234567890.apps.googleusercontent.com"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
        GOOGLE_CLIENT_SECRET: {
            description: "Google OAuth client secret",
            schema: z.string(),
            secret: true,
            examples: ["xxxxxxxxxxxxxx"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
