import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const googleMapsPreset: InferPreset = {
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
