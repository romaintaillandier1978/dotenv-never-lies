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

        if (matchesEnvKey(name, PORT_KEYS)) {
            confidence += 2;
        }

        return {
            schema: `portSchema(${JSON.stringify(name)})`,
            importedSchema: "portSchema",
            confidence,
            reason: "valid TCP/UDP port number",
        };
    },
};
