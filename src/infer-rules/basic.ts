import { looksLikeUrl } from "../schemas/urls.js";
import { InferencePass, matchesEnvKey } from "./index.js";

export const numberRule: InferencePass = {
    type: "number",
    priority: 4,
    threshold: 5,

    tryInfer({ rawValue }) {
        const n = Number(rawValue);
        if (Number.isNaN(n)) return null;

        // float ou entier hors port
        if (rawValue.includes(".") || n < 1 || n > 65535) {
            return {
                schema: "z.coerce.number()",
                importedSchemas: [],
                confidence: 6,
                reasons: ["numeric value"],
            };
        }

        return null;
    },
};

export const URL_KEYS: string[] = ["URL", "URI", "LINK", "ENDPOINT", "API_URL", "API_ENDPOINT", "API_LINK", "API_URI"];
export const urlRule: InferencePass = {
    type: "url",
    priority: 5,
    threshold: 5,

    tryInfer({ name, rawValue }) {
        if (!looksLikeUrl(rawValue)) return null;

        let confidence = 5;
        const reasons: string[] = ["Valid http(s) URL"];

        const { matched, reason } = matchesEnvKey(name, URL_KEYS);
        if (matched) {
            confidence += 2;
            reasons.push(`${reason} (+2)`);
        }

        return {
            schema: "z.url()",
            importedSchemas: [],
            confidence,
            reasons,
        };
    },
};
export const emailRule: InferencePass = {
    type: "email",
    priority: 2,
    threshold: 5,

    tryInfer({ rawValue }) {
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(rawValue)) return null;

        return {
            schema: "z.string().email()",
            importedSchemas: [],
            confidence: 6,
            reasons: ["Email-like value"],
        };
    },
};
export const stringRule: InferencePass = {
    type: "string",
    priority: 0,
    threshold: 0,

    tryInfer() {
        return {
            schema: "z.string()",
            importedSchemas: [],
            confidence: 0,
            reasons: ["Fallback to string"],
        };
    },
};
