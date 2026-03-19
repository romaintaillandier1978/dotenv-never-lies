import { looksLikeIp } from "../../schemas/dotted.js";
import { ipGenSchema } from "../generated/ip.js";
import { matchesEnvKey } from "../helpers.js";
import { HeuristicRule } from "../heuristic.types.js";

const IP_KEYS = ["IP", "ADDRESS", "HOST", "HOSTNAME"];

export const ipRule: HeuristicRule<"ip"> = {
    meta: {
        kind: "ip",
        priority: 5.5,
        threshold: 5,
    },
    tryInfer({ name, rawValue }) {
        const trimmed = rawValue.trim();
        if (!looksLikeIp(trimmed)) return null;

        let confidence = 5;
        const reasons: string[] = ["Value matches strict ip format (+5)"];

        const { matched, reason } = matchesEnvKey(name, IP_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            generated: ipGenSchema(name),
            confidence,
            reasons,
        };
    },
};
