import { InferenceInput, InferencePass, InferenceResult, matchesEnvKey } from "./index.js";
const JSON_KEYS_HIGH = ["_JSON", "JOSN_"];
const JSON_KEYS_LOW = ["_PAYLOAD", "_CONFIG", "_DATA", "_META"];

export const jsonRule: InferencePass = {
    type: "json",
    priority: 10,
    threshold: 5,
    tryInfer({ name, rawValue }) {
        let parsed: unknown;

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
        } else {
            // JSON primitif : valide mais suspect
            confidence += 2;
        }

        // 🔤 heuristiques sur le nom
        if (matchesEnvKey(name, JSON_KEYS_HIGH)) {
            confidence += 2;
        } else if (matchesEnvKey(name, JSON_KEYS_LOW)) {
            confidence += 1;
        }

        if (confidence < this.threshold) return null;

        return {
            schema: `jsonSchema("${name}")`,
            importedSchema: "jsonSchema",
            confidence,
            reason: "valid JSON value",
        };
    },
};
