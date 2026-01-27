import { looksLikeVersion } from "../../schemas/dotted.js";
import { HeuristicRule } from "../heuristic.types.js";
import { matchesEnvKey } from "../helpers.js";
import { versionGenSchema } from "../generated/version.js";

const VERSION_KEYS = ["VERSION", "SEMVER", "TAG", "RELEASE"];
// Note : NEVER add 2 parts version (2.0), it will conflict with numberRules (numberSchema)

export const versionRule: HeuristicRule<"version"> = {
    meta: {
        kind: "version",
        priority: 5.3,
        threshold: 5,
    },
    tryInfer({ name, rawValue }) {
        if (!looksLikeVersion(rawValue)) return null;

        let confidence = 5;
        const reasons: string[] = ["Value matches strict version format"];

        const { matched, reason } = matchesEnvKey(name, VERSION_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            generated: versionGenSchema(name),
            confidence,
            reasons,
        };
    },
};
