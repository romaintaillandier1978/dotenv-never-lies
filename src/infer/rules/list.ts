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
        if (rawValue.startsWith("{") || rawValue.startsWith("[")) return null;

        const pairs = rawValue.split(/[;,&]/).filter(Boolean);

        let validPairs = 0;
        for (const pair of pairs) {
            if (pair.includes("=")) validPairs++;
        }

        if (validPairs < 2) return null;

        const reasons: string[] = ["Multiple key=value pairs detected"];
        let confidence = 6;

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
        if (rawValue.startsWith("{") || rawValue.startsWith("[")) return null;
        if (!rawValue.includes("=")) return null;
        const reasons: string[] = ["Single key=value structure"];
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

export const listRule: InferRule = {
    type: "list",
    priority: 7,
    threshold: 5,

    tryInfer({ name, rawValue }) {
        if (rawValue.startsWith("{") || rawValue.startsWith("[")) return null;
        if (rawValue.includes("=")) return null;

        let confidence = 0;
        const reasons: string[] = [];

        const semicolonItems = rawValue.split(";").filter(Boolean);
        const commaItems = rawValue.split(",").filter(Boolean);
        let parts: string[] = [];

        if (semicolonItems.length > 1) {
            confidence += 4;
            reasons.push("multiple values separated by semicolon ';' (+4)");
            parts = semicolonItems;
        } else if (commaItems.length > 1) {
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
            };
        }
        // List of strings
        reasons.push("All elements are strings (+2)");
        confidence += 2;
        return {
            generated: listSchemaGen(name),
            confidence,
            reasons,
        };
    },
};
