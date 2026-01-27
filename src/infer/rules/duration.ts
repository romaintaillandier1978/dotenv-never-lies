import { looksLikeValidDuration } from "../../schemas/duration.js";
import { InferRule } from "../rules.types.js";
import { matchesEnvKey } from "../helpers.js";
import { durationGenSchema } from "../generated/duration.js";

const DURATION_KEYS = ["TIMEOUT", "TTL", "DELAY", "DURATION", "INTERVAL"];

export const durationRule: InferRule<"duration"> = {
    meta: {
        kind: "duration",
        priority: 6,
        threshold: 5,
    },
    tryInfer({ name, rawValue }) {
        let confidence = 0;
        const reasons: string[] = [];

        // Signal faible : le nom
        const { matched, reason } = matchesEnvKey(name, DURATION_KEYS);
        if (matched) {
            confidence += 2;
            reasons.push(`${reason} (+2)`);
        }

        // Signal fort : le format
        if (looksLikeValidDuration(rawValue)) {
            confidence += 5;
            reasons.push("Value matches strict duration format (+5)");
        }

        // Aucun signal → pas applicable
        if (confidence === 0) return null;

        return {
            generated: durationGenSchema(name),
            confidence,
            reasons,
        };
    },
};
