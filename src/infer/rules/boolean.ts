import { looksLikeValidBoolean } from "../../schemas/boolean.js";
import { InferRule } from "../types.js";
import { matchesEnvKey } from "../helpers.js";

const BOOLEAN_KEYS = ["IS", "HAS", "ENABLE", "DISABLE", "ENABLED", "DISABLED", "ALLOW", "DENY"];

export const booleanRule: InferRule = {
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
            generated: {
                code: `boolSchema("${name}")`,
                imports: [
                    {
                        name: "boolSchema",
                        from: "@romaintaillandier1978/dotenv-never-lies",
                    },
                ],
            },
            confidence: 10,
            reasons,
        };
    },
};
