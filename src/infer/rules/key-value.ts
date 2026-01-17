import { GeneratedSchema, InferRule } from "../types.js";
import { matchesEnvKey } from "../helpers.js";
import { keyValueSchemaGen } from "../generated/key-value.js";
import { zStringGenSchema } from "../generated/basic.js";
import { booleanRule } from "./boolean.js";
import { numberRule, stringRule } from "./basic.js";

const KEY_PAIR_NAMES = ["ENV", "VARS", "CONFIG", "OPTIONS"];

const looksLikeValidKeyValuePair = (value: string): boolean => {
    return /^([_a-zA-Z][a-zA-Z0-9_]*)=([^=]+)$/.test(value);
};

const KEY_VALUE_RULES: InferRule[] = [
    booleanRule, // 6
    numberRule, //3
    stringRule, //0
].sort((a, b) => b.priority - a.priority);

const inferSimpleSchemaForKeyPart = (rawValue: string): GeneratedSchema => {
    for (const rule of KEY_VALUE_RULES) {
        const result = rule.tryInfer({ name: "", rawValue });

        if (!result) continue;

        if (result.confidence >= rule.threshold) {
            return result.generated;
        }
    }

    return zStringGenSchema;
};

export const keyValueRule: InferRule = {
    type: "keyValue",
    priority: 3.5,
    threshold: 5,

    tryInfer({ name, rawValue }) {
        // we assume that we can infer that the splitter is "=" !
        // even if the schema supports more possibilities.
        const splitter = "=";
        if (!looksLikeValidKeyValuePair(rawValue)) return null;

        const reasons: string[] = [];
        let confidence = 5;

        reasons.push("Single key=value structure (+5)");

        const parts = rawValue.split(splitter);

        const { matched, reason } = matchesEnvKey(name, KEY_PAIR_NAMES);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        const valuePart = parts[1];

        const valueGen = inferSimpleSchemaForKeyPart(valuePart);

        const result = {
            generated: keyValueSchemaGen(name, splitter, valueGen),
            confidence,
            reasons,
        };
        return result;
    },
};
