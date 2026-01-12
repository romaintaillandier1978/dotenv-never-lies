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
        const reasons: string[] = ["Value matches strict boolean format"];
        const { matched, reason } = matchesEnvKey(name, BOOLEAN_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            schema: `boolSchema("${name}")`,
            importedSchemas: ["boolSchema"],
            confidence: 10,
            reasons,
        };
    },
};
