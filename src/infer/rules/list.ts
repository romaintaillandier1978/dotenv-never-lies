import { areAllSameGenSchemas, areSameGenSchemas, inferSimpleSchemaForListItem } from "../helpers.js";
import { InferRule } from "../types.js";
import { matchesEnvKey } from "../helpers.js";
import { keyValueListSchemaGen, listSchemaGen, urlListSchemaGen, emailListSchemaGen, keyValueSchemaGen, listOfSchemaGen } from "../generated/list.js";
import { portGenSchemaNoName } from "../generated/port.js";
import { zEmailGenSchema, zNumberGenSchema, zUrlGenSchema } from "../generated/basic.js";

const KEY_PAIR_NAMES_LIST = ["MAPS", "LABELS", "HEADERS", "PARAMS"];

export const keyValueListRule: InferRule = {
    type: "keyValueList",
    priority: 9,
    threshold: 6,

    tryInfer({ name, rawValue }) {
        const pairsType1 = rawValue.split(";");
        const pairsType2 = rawValue.split(",");
        const pairsType3 = rawValue.split("&");

        const hasType1 = pairsType1.length > 1;
        const hasType2 = pairsType2.length > 1;
        const hasType3 = pairsType3.length > 1;

        if (hasType1 && hasType2 && hasType3) return null;

        let confidence = 2;
        const reasons: string[] = [];
        let pairs: string[] = [];

        if (hasType1) {
            pairs = pairsType1;
            confidence += 2;
            reasons.push("Multiple pairs separated by semicolon ';' (+2)");
            if (hasType2 || hasType3) {
                confidence -= 1;
                reasons.push("Semicolon has priority over comma and &, but comma and & detected, possible bad separator identified (-1)");
            }
        } else if (hasType2) {
            pairs = pairsType2;
            confidence += 2;
            reasons.push("Multiple pairs separated by comma ',' (+2)");
            if (hasType3) {
                confidence -= 1;
                reasons.push("Comma has priority over &, but & detected, possible bad separator identified (-1)");
            }
        } else if (hasType3) {
            pairs = pairsType3;
            confidence += 2;
            reasons.push("Multiple pairs separated by '&' (+2)");
        }

        // no pairs found
        if (pairs.length < 1) return null;

        let validPairs1 = 0;
        let validPairs2 = 0;
        // TODO pairs must have all the same type of separator (= or :)
        for (const pair of pairs) {
            if (pair.includes("=")) validPairs1++;
            if (pair.includes(":")) validPairs2++;
        }

        if (validPairs1 !== pairs.length && validPairs2 !== pairs.length) return null;

        if (validPairs1 === pairs.length) {
            confidence += 2;
            reasons.push("All pairs are key=value pairs (+2)");
            if (validPairs2 === pairs.length) {
                confidence -= 1;
                reasons.push("Both key=value and key:value pairs detected, possible bad separator identified (-1)");
            }
        } else if (validPairs2 === pairs.length) {
            confidence += 2;
            reasons.push("All pairs are key:value pairs (+2)");
        }

        const { matched, reason } = matchesEnvKey(name, KEY_PAIR_NAMES_LIST);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            generated: keyValueListSchemaGen(name),
            confidence,
            reasons,
        };
    },
};

const KEY_PAIR_NAMES = ["ENV", "VARS", "CONFIG", "OPTIONS"];

export const keyValueRule: InferRule = {
    type: "keyValue",
    priority: 8,
    threshold: 5,

    tryInfer({ name, rawValue }) {
        if (!rawValue.includes("=") && !rawValue.includes(":")) return null;
        const reasons: string[] = ["Single key=value or key:value structure"];
        let confidence = 4;

        const { matched, reason } = matchesEnvKey(name, KEY_PAIR_NAMES);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            generated: keyValueSchemaGen(name),
            confidence,
            reasons,
        };
    },
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
        let parts: string[] = [];
        let confidence = 0;
        const reasons: string[] = [];
        const warnings: string[] = [];
        const hasSemicolon = semicolonItems.length > 1;
        const hasComma = commaItems.length > 1;

        const isOnlyEmptyList = /^;+$/.test(rawValue) || /^,+$/.test(rawValue);

        if (isOnlyEmptyList) {
            warnings.push(" ⚠️ Inferred list was detected as containing only empty values, consider completing the 'of' parameter of the listSchema");
        }

        if (hasSemicolon) {
            confidence += 4;
            reasons.push("multiple values separated by semicolon ';' (+4)");
            parts = semicolonItems;
            if (hasComma) {
                confidence -= 1;
                reasons.push("semicolon has priority over comma, but comma detected, possible bad separator identified (-1)");
            }
        } else if (hasComma) {
            confidence += 4;
            reasons.push("multiple values separated by comma ',' (+4)");
            parts = commaItems;
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
                generated: listSchemaGen(name),
                confidence,
                reasons,
                warnings,
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
                generated: listOfSchemaGen(name, itemTypes[0]),
                confidence,
                reasons,
                warnings,
            };
        }

        // List of emails
        if (areSameGenSchemas(itemTypes[0], zEmailGenSchema)) {
            reasons.push("All elements are emails (+2)");
            confidence += 2;
            return {
                generated: emailListSchemaGen(name),
                confidence,
                reasons,
                warnings,
            };
        }

        // here we assume we have a list of simple URLs.
        // possible evolution with all types of URLs.
        // List of URLs
        if (areSameGenSchemas(itemTypes[0], zUrlGenSchema)) {
            reasons.push("All elements are URLs (+2)");
            confidence += 2;
            return {
                generated: urlListSchemaGen(name),
                confidence,
                reasons,
                warnings,
            };
        }
        // List of numbers
        if (areSameGenSchemas(itemTypes[0], zNumberGenSchema)) {
            reasons.push("All elements are numbers (+2)");
            confidence += 2;
            return {
                generated: listOfSchemaGen(name, itemTypes[0]),
                confidence,
                reasons,
                warnings,
            };
        }
        // List of strings
        reasons.push("All elements are strings (+2)");
        confidence += 2;
        return {
            generated: listSchemaGen(name),
            confidence,
            reasons,
            warnings,
        };
    },
};
