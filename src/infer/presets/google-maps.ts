import { z } from "zod";
import { PressetDef } from "../presets.types.js";

export const googleMapsPreset: PressetDef = {
    origin: "google-maps",
    presets: {
        GOOGLE_MAPS_API_KEY: {
            description: "Google Maps API key",
            schema: z.string(),
            secret: true,
            examples: ["AIzaSyD-EXAMPLEKEY"],
            kind: "string",
            code: "z.string()",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};
