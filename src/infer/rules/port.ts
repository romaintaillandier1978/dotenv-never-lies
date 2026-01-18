import { InferRule } from "../types.js";
import { matchesEnvKey } from "../helpers.js";
import { portGenSchema } from "../generated/port.js";

const PORT_KEYS = ["PORT"];

export const portRule: InferRule<"port"> = {
    kind: "port",
    priority: 7,
    threshold: 5,
    tryInfer({ name, rawValue }) {
        // reject floats, versions (2.0), weird numbers
        if (!/^\d+$/.test(rawValue)) {
            return null;
        }
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
            generated: portGenSchema(name),
            confidence,
            reasons,
        };
    },
};
