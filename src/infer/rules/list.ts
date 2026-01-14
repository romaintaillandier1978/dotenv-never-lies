import { inferSimpleSchemaForListItem } from "../helpers.js";
import { InferRule } from "../types.js";
import { matchesEnvKey } from "../helpers.js";

const DOUBLE_SEPARATORS = [
    [";", "="],
    [",", "="],
    ["&", "="],
];
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
            generated: {
                code: `keyValueListSchema("${JSON.stringify(name)}")`,
                imports: [
                    {
                        name: "keyValueListSchema",
                        from: "@romaintaillandier1978/dotenv-never-lies",
                    },
                ],
            },
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
            generated: {
                code: `keyValueSchema("${JSON.stringify(name)}")`,
                imports: [
                    {
                        name: "keyValueSchema",
                        from: "@romaintaillandier1978/dotenv-never-lies",
                    },
                ],
            },
            confidence,
            reasons,
        };
    },
};

const LIST_KEYS = ["LIST", "ITEMS", "ARRAY", "VALUES"];

const allElementsAreEquals = (elements: string[]) => {
    const e0 = elements[0];
    return elements.every((e) => e === e0);
};

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

        const itemTypes = parts.map((value) => inferSimpleSchemaForListItem("", value));
        if (allElementsAreEquals(itemTypes)) {
            reasons.push("All elements are of the same type (+2)");
            confidence += 2;
            switch (itemTypes[0]) {
                case 'portSchema("")':
                    reasons.push("All elements are PORTS (+2)");
                    confidence += 2;

                    return {
                        generated: {
                            code: `listSchema(${JSON.stringify(name)}, { of: ${itemTypes[0]} })`,
                            imports: [
                                { name: "listSchema", from: "@romaintaillandier1978/dotenv-never-lies" },
                                { name: "portSchema", from: "@romaintaillandier1978/dotenv-never-lies" },
                            ],
                        },
                        confidence,
                        reasons,
                    };
                case "z.url()":
                    reasons.push("All elements are URLs (+2)");
                    confidence += 2;
                    return {
                        generated: {
                            code: `urlListSchema("${JSON.stringify(name)}")`,
                            imports: [{ name: "urlListSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
                        },
                        confidence,
                        reasons,
                    };
                case "z.email()":
                    reasons.push("All elements are emails (+2)");
                    confidence += 2;
                    return {
                        generated: {
                            code: `emailListSchema("${JSON.stringify(name)}")`,
                            imports: [{ name: "emailListSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
                        },
                        confidence,
                        reasons,
                    };
                case "z.number()":
                    reasons.push("All elements are numbers (+2)");
                    confidence += 2;
                    return {
                        generated: {
                            code: `listSchema(${JSON.stringify(name)}, { of: z.number() })`,
                            imports: [{ name: "listSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
                        },
                        confidence,
                        reasons,
                    };
                default:
                    //vraie liste de string
                    reasons.push("All elements are strings (+2)");
                    confidence += 2;
                    return {
                        generated: {
                            code: `listSchema(${JSON.stringify(name)})`,
                            imports: [{ name: "listSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
                        },
                        confidence,
                        reasons,
                    };
            }
        }

        // liste de type mixte
        return {
            generated: {
                code: `listSchema(${JSON.stringify(name)})`,
                imports: [{ name: "listSchema", from: "@romaintaillandier1978/dotenv-never-lies" }],
            },
            confidence,
            reasons,
        };
    },
};
