import { areAllSameGenSchemas, areSameGenSchemas } from "../helpers.js";
import { GeneratedSchema, InferRule } from "../types.js";
import { matchesEnvKey } from "../helpers.js";
import { keyValueListSchemaGen, listSchemaGen, urlListSchemaGen, emailListSchemaGen, listOfSchemaGen } from "../generated/list.js";
import { portGenSchemaNoName } from "../generated/port.js";
import { zEmailGenSchema, zNumberGenSchema, zStringGenSchema, zUrlGenSchema } from "../generated/basic.js";
import { keyValueSchemaGenNoName } from "../generated/key-value.js";
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
        reasons.push("All elements are of the same type (+2)");
        confidence += 2;

        // List of ports
        if (areSameGenSchemas(itemTypes[0], portGenSchemaNoName)) {
            reasons.push("All elements are PORTS (+2)");
            confidence += 2;
            return {
                generated: listOfSchemaGen(name, splitter, itemTypes[0]),
                confidence,
                reasons,
                codeWarnings,
            };
        }

        // here we assume we have a list of simple URLs.
        // possible evolution with all types of URLs.
        // List of URLs

        // if (areSameGenSchemas(itemTypes[0], zUrlGenSchema)) {
        if (itemTypes[0].code.includes("UrlSchema")) {
            reasons.push("All elements are URLs (+2)");
            confidence += 2;
            return {
                generated: listSchemaGen(name, splitter, itemTypes[0]),
                confidence,
                reasons,
                codeWarnings,
            };
        }

        // List of emails
        if (areSameGenSchemas(itemTypes[0], zEmailGenSchema)) {
            reasons.push("All elements are emails (+2)");
            confidence += 2;
            return {
                generated: emailListSchemaGen(name, splitter),
                confidence,
                reasons,
                codeWarnings,
            };
        }

        // List of key-value pairs
        // if (areSameGenSchemas(itemTypes[0], keyValueSchemaGenNoName)) {
        if (itemTypes[0].code.includes("keyValueSchema")) {
            reasons.push("All elements are key-value pairs (+2)");
            confidence += 2;
            return {
                generated: listSchemaGen(name, splitter, itemTypes[0]),
                // On devrait reussir a produire ca !
                //generated: keyValueListSchemaGen(name, splitter, itemTypes[0]),
                confidence,
                reasons,
                codeWarnings,
            };
        }

        // List of numbers
        if (areSameGenSchemas(itemTypes[0], zNumberGenSchema)) {
            reasons.push("All elements are numbers (+2)");
            confidence += 2;
            return {
                generated: listOfSchemaGen(name, splitter, itemTypes[0]),
                confidence,
                reasons,
                codeWarnings,
            };
        }
        // List of strings
        reasons.push("All elements are strings (+2)");
        confidence += 2;
        return {
            generated: listSchemaGen(name, splitter, zStringGenSchema),
            confidence,
            reasons,
            codeWarnings,
        };
    },
};
