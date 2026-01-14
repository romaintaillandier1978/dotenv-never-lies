import { looksLikeIp } from "../../schemas/dotted.js";
import { matchesEnvKey } from "../helpers.js";
import { InferRule } from "../types.js";

const IP_KEYS = ["IP", "ADDRESS", "HOST", "HOSTNAME"];

export const ipRule: InferRule = {
    type: "ip",
    priority: 5.5,
    threshold: 5,
    tryInfer({ name, rawValue }) {
        if (!looksLikeIp(rawValue)) return null;

        let confidence = 5;
        const reasons: string[] = ["Value matches strict ip format"];

        const { matched, reason } = matchesEnvKey(name, IP_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            generated: {
                code: `ipSchema(${JSON.stringify(name)})`,
                imports: [
                    {
                        name: "ipSchema",
                        from: "@romaintaillandier1978/dotenv-never-lies",
                    },
                ],
            },
            confidence,
            reasons,
        };
    },
};
