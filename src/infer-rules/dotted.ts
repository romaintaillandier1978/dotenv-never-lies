import { looksLikeIp, looksLikeVersion } from "../schemas/dotted.js";
import { InferencePass, matchesEnvKey } from "./index.js";

const IP_KEYS = ["_IP", "_ADDRESS", "_HOST", "_HOSTNAME"];

export const ipRule: InferencePass = {
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
            schema: `ipSchema(${JSON.stringify(name)})`,
            importedSchemas: ["ipSchema"],
            confidence,
            reasons,
        };
    },
};

const VERSION_KEYS = ["_VERSION", "_SEMVER", "_TAG", "_RELEASE"];
// Note : NEVER add 2 parts version (2.0), it will conflict with numberRules (numberSchema)

export const versionRule: InferencePass = {
    type: "version",
    priority: 5.3,
    threshold: 5,
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
            schema: `versionSchema(${JSON.stringify(name)})`,
            importedSchemas: ["versionSchema"],
            confidence,
            reasons,
        };
    },
};
