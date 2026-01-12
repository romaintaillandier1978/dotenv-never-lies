import { InferencePass, matchesEnvKey } from "./index.js";

const PORT_KEYS = ["PORT", "PORT_", "_PORT"];

export const portRule: InferencePass = {
    type: "port",
    priority: 7,
    threshold: 5,
    tryInfer({ name, rawValue }) {
        const port = Number(rawValue);
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            return null;
        }

        let confidence = 5; // valeur seule = déjà crédible
        const reasons: string[] = ["Valid TCP/UDP port number"];
        const { matched, reason } = matchesEnvKey(name, PORT_KEYS);
        if (matched) {
            confidence += 2;
            reasons.push(`${reason} (+2)`);
        }

        return {
            schema: `portSchema("${name}")`,
            importedSchemas: ["portSchema"],
            confidence,
            reasons,
        };
    },
};
