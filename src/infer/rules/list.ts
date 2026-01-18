import { areAllSameGenSchemas } from "../helpers.js";
import { GeneratedSchema, InferRule } from "../types.js";
import { matchesEnvKey } from "../helpers.js";
import { listSchemaGen } from "../generated/list.js";
import { zStringGenSchema } from "../generated/basic.js";
import { portRule } from "./port.js";
import { urlRule } from "./url.js";
import { emailRule, numberRule, stringRule } from "./basic.js";
import { keyValueRule } from "./key-value.js";
import { booleanRule } from "./boolean.js";

const LIST_RULES: InferRule[] = [
    portRule, //7
    booleanRule, // 6
    urlRule, //5
    emailRule, //4
    keyValueRule, // 3.5
    numberRule, //3
    stringRule, //0
].sort((a, b) => b.priority - a.priority);

const inferSimpleSchemaForListItem = (rawValue: string): GeneratedSchema => {
    for (const rule of LIST_RULES) {
        const result = rule.tryInfer({ name: "", rawValue });

        if (!result) continue;

        if (result.confidence >= rule.threshold) return result.generated;
    }

    return zStringGenSchema;
};

const LIST_KEYS = ["LIST", "ITEMS", "ARRAY", "VALUES"];

/**
 * Infers a list schema from a raw value. Infer using ';' and ','.
 * if ';' and ',' are used, ';' has priority.
 * @param name - The name of the list.
 * @param rawValue - The raw value of the list.
 * @returns The inferred list schema.
 */
export const listRule: InferRule = {
    type: "list",
    priority: 7,
    threshold: 5,
    tryInfer({ name, rawValue }) {
        const semicolonItems = rawValue.split(";");
        const commaItems = rawValue.split(",");
        const ampersandItems = rawValue.split("&");
        let parts: string[] = [];
        let confidence = 0;
        let splitter: string = ";";
        const reasons: string[] = [];
        const codeWarnings: string[] = [];
        const hasSemicolon = semicolonItems.length > 1;
        const hasComma = commaItems.length > 1;
        const hasAmpersand = ampersandItems.length > 1;

        const isOnlyEmptyList = /^;+$/.test(rawValue) || /^,+$/.test(rawValue);

        if (isOnlyEmptyList) {
            codeWarnings.push(" ⚠️ Inferred list was detected as containing only empty values, consider completing the 'of' parameter of the listSchema");
        }

        if (hasSemicolon) {
            confidence += 4;
            reasons.push("multiple values separated by semicolon ';' (+4)");
            parts = semicolonItems;
            splitter = ";";
            if (hasComma || hasAmpersand) {
                confidence -= 1;
                reasons.push("semicolon has priority over comma and ampersand, but comma or ampersand detected, possible bad separator identified (-1)");
            }
        } else if (hasComma) {
            confidence += 4;
            reasons.push("multiple values separated by comma ',' (+4)");
            parts = commaItems;
            splitter = ",";
            if (hasAmpersand || hasSemicolon) {
                confidence -= 1;
                reasons.push("comma has priority over ampersand, but ampersand detected, possible bad separator identified (-1)");
            }
        } else if (hasAmpersand) {
            confidence += 4;
            reasons.push("multiple values separated by ampersand '&' (+4)");
            parts = ampersandItems;
            splitter = "&";
        }
        if (!parts || parts.length === 0) return null;

        const { matched, reason } = matchesEnvKey(name, LIST_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        const itemTypes = parts.map((value) => inferSimpleSchemaForListItem(value));

        // if some elements are of different types => list of strings.
        if (!areAllSameGenSchemas(itemTypes)) {
            return {
                generated: listSchemaGen(name, splitter, zStringGenSchema),
                confidence,
                reasons,
                codeWarnings,
            };
        }
        // from here, all elements are of the same type => we can generate a typed list

        confidence += 4;
        reasons.push("All elements are type of " + itemTypes[0].kind + " (+4)");
        return {
            generated: listSchemaGen(name, splitter, itemTypes[0]),
            confidence,
            reasons,
            codeWarnings,
        };
    },
};
