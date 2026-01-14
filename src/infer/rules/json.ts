import { InferRule } from "../types.js";
import { matchesEnvKey } from "../helpers.js";
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

        // si pas de {} ni de [], on se retrouve avec une valeur seule, genre "\"romain\"" ou "\"2\"". (avec des guillemets)
        // Ce serait effectivement un json valie, mais peu de chance que ce soit _intentionnel_
        // 🔥 structure JSON forte
        if (rawValue.startsWith("{") || rawValue.startsWith("[")) {
            confidence += 6;
            reasons.push("JSON structure (+6)");
        } else {
            // JSON primitif : valide mais suspect
            confidence += 2;
            reasons.push("JSON primitive (+2)");
        }

        // 🔤 heuristiques sur le nom
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

        if (confidence < this.threshold) return null;

        return {
            generated: {
                code: `jsonSchema("${JSON.stringify(name)}")`,
                imports: [
                    {
                        name: "jsonSchema",
                        from: "@romaintaillandier1978/dotenv-never-lies",
                    },
                ],
            },
            confidence,
            reasons,
        };
    },
};
