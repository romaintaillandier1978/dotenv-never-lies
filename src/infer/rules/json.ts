import { InferRule } from "../types.js";
import { matchesEnvKey } from "../helpers.js";
import { jsonGenSchema } from "../generated/json.js";
const JSON_KEYS_HIGH = ["JSON"];
const JSON_KEYS_LOW = ["PAYLOAD", "CONFIG", "DATA", "META"];

export const jsonRule: InferRule = {
    type: "json",
    priority: 10,
    threshold: 5,
    tryInfer({ name, rawValue }) {
        let parsed: unknown;

        const reasons: string[] = [];
        try {
            parsed = JSON.parse(rawValue);
        } catch {
            return null;
        }

        let confidence = 0;

        // if no {} or [], we end up with a single value, like "\"romain\"" or "\"2\"". (with quotes)
        // This would be a valid JSON, but very unlikely to be intentional.
        if (rawValue.startsWith("{") || rawValue.startsWith("[")) {
            // strong JSON structure (+6)
            confidence += 6;
            reasons.push("JSON structure (+6)");
        } else {
            // JSON primitive : valid but suspicious (+2)
            confidence += 2;
            reasons.push("JSON primitive (+2)");
        }

        const { matched: matchedHigh, reason: reasonHigh } = matchesEnvKey(name, JSON_KEYS_HIGH);
        if (matchedHigh) {
            confidence += 2;
            reasons.push(`${reasonHigh} (+2)`);
        }
        const { matched: matchedLow, reason: reasonLow } = matchesEnvKey(name, JSON_KEYS_LOW);
        if (matchedLow) {
            confidence += 1;
            reasons.push(`${reasonLow} (+1)`);
        }

        return {
            generated: jsonGenSchema(name),
            confidence,
            reasons,
        };
    },
};
