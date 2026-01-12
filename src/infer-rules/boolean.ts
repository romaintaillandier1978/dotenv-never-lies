import { looksLikeValidBoolean } from "../schemas/boolean.js";
import { InferencePass, matchesEnvKey } from "./index.js";

const BOOLEAN_KEYS = ["IS_", "HAS_", "ENABLE_", "DISABLE_", "_ENABLED", "_DISABLED", "ALLOW_", "DENY_"];

export const booleanRule: InferencePass = {
    type: "boolean",
    priority: 6,
    threshold: 5,
    tryInfer({ name, rawValue }) {
        if (!looksLikeValidBoolean(rawValue)) return null;
        let confidence = 6; // valeur bool = signal fort
        if (matchesEnvKey(name, BOOLEAN_KEYS)) {
            confidence += 1;
        }

        return {
            schema: `boolSchema("${name}")`,
            importedSchema: "boolSchema",
            confidence: 10,
        };
    },
};
