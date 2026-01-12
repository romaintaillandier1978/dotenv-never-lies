import { InferencePass } from "./index.js";

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
                confidence: 6,
                reason: "numeric value",
            };
        }

        return null;
    },
};
export const urlRule: InferencePass = {
    type: "url",
    priority: 3,
    threshold: 5,

    tryInfer({ rawValue }) {
        try {
            const url = new URL(rawValue);
            if (!url.protocol.startsWith("http")) return null;

            return {
                schema: "z.string().url()",
                confidence: 6,
                reason: "valid http(s) URL",
            };
        } catch {
            return null;
        }
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
            confidence: 6,
            reason: "email-like value",
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
            confidence: 0,
            reason: "fallback",
        };
    },
};
