import { InferRule } from "../rules.types.js";
import { matchesEnvKey } from "../helpers.js";
import { jsonGenSchema } from "../generated/json.js";
import { zArrayOfUnknownGenSchema, zUnknownGenSchema } from "../generated/basic.js";
const JSON_KEYS_HIGH = ["JSON"];
const JSON_KEYS_LOW = ["PAYLOAD", "CONFIG", "DATA", "META"];

export const jsonRule: InferRule<"json"> = {
    kind: "json",
    priority: 10,
    threshold: 5,
    tryInfer({ name, rawValue }) {
        let parsed: unknown;
        // trim the raw value to avoid issues with leading or trailing spaces
        // never happen via dotenv, but migth happen via process.env
        if (rawValue === "" || rawValue === "''" || rawValue === '""') return null;
        const trimedRawValue = rawValue.trim();

        const reasons: string[] = [];
        try {
            parsed = JSON.parse(trimedRawValue);
        } catch {
            return null;
        }

        let confidence = 0;

        // if no {} or [], we end up with a single value, like "\"romain\"" or "\"2\"". (with quotes)
        // This would be a valid JSON, but very unlikely to be intentional.
        if (trimedRawValue.startsWith("{") || trimedRawValue.startsWith("[")) {
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

        const isArray = trimedRawValue.startsWith("[") && trimedRawValue.endsWith("]");
        return {
            generated: jsonGenSchema(name, isArray ? zArrayOfUnknownGenSchema : zUnknownGenSchema),
            confidence,
            reasons,
            codeWarnings: [
                isArray
                    ? " ⚠️ Inferred string was detected as containing a json array, please think to complete the 'of' parameter of the jsonSchema"
                    : " ⚠️ Inferred string was detected as containing a json object, please think to complete the 'of' parameter of the jsonSchema",
            ],
        };
    },
};
