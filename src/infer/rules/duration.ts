import { looksLikeValidDuration } from "../../schemas/duration.js";
import { InferRule } from "../types.js";
import { matchesEnvKey } from "../helpers.js";
import { durationGenSchema } from "../generated/duration.js";

const DURATION_KEYS = ["TIMEOUT", "TTL", "DELAY", "DURATION", "INTERVAL"];

export const durationRule: InferRule = {
    type: "duration",
    priority: 6,
    threshold: 5,
    tryInfer({ name, rawValue }) {
        if (!looksLikeValidDuration(rawValue)) return null;

        let confidence = 6;
        const reasons: string[] = ["Value matches strict duration format"];

        const { matched, reason } = matchesEnvKey(name, DURATION_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            generated: durationGenSchema(name),
            confidence,
            reasons,
        };
    },
};
