import { InferPreset } from "../presets.types.js";
import { z } from "zod";


export const something1 : InferPreset = {
    origin : "something1",
    presets : {
        NODE_ENV: {
            description: "Environnement node de la plateforme 1",
            schema: z.enum([ "development", "staging", "production"]),
            secret: true,
            examples: [ "development", "staging", "production"],
            kind: "enum",
            code: "z.enum([\"development\", \"staging\", \"production\"])",
            imports: [],
        }
    },
};

export const something2 : InferPreset = {
    origin : "something2",
    presets : {
        NODE_ENV: {
            description: "Environnement node de la plateforme 2",
            schema: z.enum(["test", "development", "staging", "production"]),
            secret: true,
            examples: ["test", "development", "staging", "production"],
            kind: "enum",
            code: "z.enum([\"test\", \"development\", \"staging\", \"production\"])",
            imports: [],
        }
    },
};
