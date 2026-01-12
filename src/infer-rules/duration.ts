import { looksLikeValidDuration } from "../schemas/duration.js";
import { InferencePass, matchesEnvKey } from "./index.js";

const DURATION_KEYS = ["_TIMEOUT", "_TTL", "_DELAY", "_DURATION", "_INTERVAL"];

export const durationRule: InferencePass = {
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
            schema: `durationSchema(${JSON.stringify(name)})`,
            importedSchemas: ["durationSchema"],
            confidence,
            reasons,
        };
    },
};
