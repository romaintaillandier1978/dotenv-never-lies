import { InferRule } from "../types.js";
import { zEmailGenSchema, zNumberGenSchema, zStringGenSchema } from "../generated/basic.js";
import { matchesEnvKey } from "../helpers.js";

const NUMBER_KEYS = ["NUMBER", "NUM", "NB", "COUNT", "SIZE", "LENGTH", "RATE", "PRICE", "COST", "TOTAL", "SUM", "AVG", "MIN", "MAX"];

/**
 * Infers a number schema from a raw value. match vlaue like 42, "42", -1000, +7e6, etc.
 * @param name - The name of the environment variable.
 * @param rawValue - The raw value of the environment variable.
 * @returns The inferred number schema.
 */
export const numberRule: InferRule<"number"> = {
    kind: "number",
    priority: 4,
    threshold: 5,

    tryInfer({ name, rawValue }) {
        let candidate = rawValue;
        // We decided that number schema is coercive (z.coerce.number()),
        // so we accept quotes "42" or '42', but no empty string "", '', '   '.
        // note that number('   ') returns 0, which is not what we want
        // never happen via dotenv, but migth happen via process.env
        if (candidate === "" || candidate === "''" || candidate === '""') return null;
        if ((candidate.startsWith('"') && candidate.endsWith('"')) || (candidate.startsWith("'") && candidate.endsWith("'")))
            candidate = candidate.slice(1, -1);
        // never happen via dotenv, but migth happen via process.env
        if (candidate.trim().match(/^\s*$/)) return null;

        const n = Number(+candidate);
        if (Number.isNaN(n)) return null;

        let confidence = 5;
        const reasons: string[] = ["Numeric value"];

        const { matched, reason } = matchesEnvKey(name, NUMBER_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            generated: zNumberGenSchema,
            confidence,
            reasons,
        };
    },
};

const EMAIL_KEYS = ["EMAIL", "MAIL"];

export const emailRule: InferRule = {
    kind: "email",
    priority: 4,
    threshold: 5,

    tryInfer({ name, rawValue }) {
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(rawValue)) return null;

        let confidence = 6;
        const reasons: string[] = ["Email-like value"];

        const { matched, reason } = matchesEnvKey(name, EMAIL_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }
        return {
            generated: zEmailGenSchema,
            confidence,
            reasons,
        };
    },
};

export const stringRule: InferRule = {
    kind: "string",
    priority: 0,
    threshold: 0,

    tryInfer({ rawValue }) {
        const reasons: string[] = [];
        const codeWarnings: string[] = [];

        // never happen via dotenv, but migth happen via process.env
        if (rawValue === "" || rawValue === "''" || rawValue === '""') {
            codeWarnings.push(" ⚠️ Inferred string was detected as an empty string, may indicate optional variable of any type");
        } else {
            const containsOnlyBlank = rawValue.match(/^\s+$/);
            if (containsOnlyBlank) {
                codeWarnings.push(" ⚠️ Inferred string was detected as containing only blank spaces, may indicate optional variable of any type");
            }
        }

        return {
            generated: zStringGenSchema,
            confidence: 0,
            reasons: [...reasons, "Fallback to string"],
            codeWarnings,
        };
    },
};
