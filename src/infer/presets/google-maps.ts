import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const googleMapsPreset: InferPreset = {
    origin: "google-maps",
    presets: {
        GOOGLE_MAPS_API_KEY: {
            description: "Google Maps API key",
            schema: z.string().min(1),
            secret: true,
            examples: ["AIzaSyD-EXAMPLEKEY"],
            kind: "string",
            code: "z.string().min(1)",
            imports: [{ name: "z", from: "zod" }],
        },
    },
};