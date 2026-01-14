import { InferRule } from "../types.js";
import { zEmailGenSchema, zNumberGenSchema, zStringGenSchema } from "../generated/basic.js";

export const numberRule: InferRule = {
    type: "number",
    priority: 4,
    threshold: 5,

    tryInfer({ rawValue }) {
        const n = Number(rawValue);
        if (Number.isNaN(n)) return null;

        // float ou entier hors port
        if (rawValue.includes(".") || n < 1 || n > 65535) {
            return {
                generated: zNumberGenSchema,
                confidence: 6,
                reasons: ["numeric value"],
            };
        }

        return null;
    },
};

export const emailRule: InferRule = {
    type: "email",
    priority: 4,
    threshold: 5,

    tryInfer({ rawValue }) {
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(rawValue)) return null;

        return {
            generated: zEmailGenSchema,
            confidence: 6,
            reasons: ["Email-like value"],
        };
    },
};
export const stringRule: InferRule = {
    type: "string",
    priority: 0,
    threshold: 0,

    tryInfer() {
        return {
            generated: zStringGenSchema,
            confidence: 0,
            reasons: ["Fallback to string"],
        };
    },
};
