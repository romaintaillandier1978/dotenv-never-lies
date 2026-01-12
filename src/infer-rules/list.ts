import { inferSimpleSchemaForListItem } from "../cli/utils/infer-schema.js";
import { InferencePass, matchesEnvKey } from "./index.js";

const DOUBLE_SEPARATORS = [
    [";", "="],
    [",", "="],
    ["&", "="],
];
const KEY_PAIR_NAMES_LIST = ["_MAPS", "_LABELS", "_HEADERS", "_PARAMS"];

export const keyValueListRule: InferencePass = {
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
            schema: `keyValueListSchema("${name}")`,
            importedSchemas: ["keyValueListSchema"],
            confidence,
            reasons,
        };
    },
};

const KEY_PAIR_NAMES = ["_ENV", "_VARS", "_CONFIG", "_OPTIONS"];

export const keyValueRule: InferencePass = {
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
            schema: `keyValueSchema("${name}")`,
            importedSchemas: ["keyValueSchema"],
            confidence,
            reasons,
        };
    },
};

const LIST_KEYS = ["_LIST", "_ITEMS", "_ARRAY", "_VALUES"];

const allElementsAreEquals = (elements: string[]) => {
    const e0 = elements[0];
    return elements.every((e) => e === e0);
};

export const listRule: InferencePass = {
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
                        schema: `listSchema("${name}", { of: ${itemTypes[0]} })`,
                        importedSchemas: ["listSchema", "portSchema"],
                        confidence,
                        reasons,
                    };
                case "z.url()":
                    reasons.push("All elements are URLs (+2)");
                    confidence += 2;
                    return {
                        schema: `urlListSchema("${name}")`,
                        importedSchemas: ["urlListSchema"],
                        confidence,
                        reasons,
                    };
                case "z.email()":
                    reasons.push("All elements are emails (+2)");
                    confidence += 2;
                    return {
                        schema: `emailListSchema("${name}")`,
                        importedSchemas: ["emailListSchema"],
                        confidence,
                        reasons,
                    };
                case "z.number()":
                    reasons.push("All elements are numbers (+2)");
                    confidence += 2;
                    return {
                        schema: `listSchema("${name}", { of: z.number() })`,
                        importedSchemas: ["listSchema"],
                        confidence,
                        reasons,
                    };
                default:
                    //vraie liste de string
                    reasons.push("All elements are strings (+2)");
                    confidence += 2;
                    return {
                        schema: `listSchema("${name}")`,
                        importedSchemas: ["listSchema"],
                        confidence,
                        reasons,
                    };
            }
        }

        // liste de type mixte
        return {
            schema: `listSchema("${name}")`,
            importedSchemas: ["listSchema"],
            confidence,
            reasons,
        };
    },
};

const URL_LIST_KEYS = ["_URLS", "_LINKS", "_ENDPOINTS", "_APIS", "CORS"];
// export const urlListRule: InferencePass = {
//     type: "urlList",
//     priority: 6, // juste sous url, au-dessus de filePath
//     threshold: 5,

//     tryInfer({ name, rawValue }) {
//         const parts = rawValue
//             .split(/[;,]/)
//             .map((v) => v.trim())
//             .filter(Boolean);
//         if (parts.length < 2) return null;
//         let confidence = 1;
//         const reasons: string[] = ["Multiple values separated by delimiter (+1)"];

//         for (const part of parts) {
//             try {
//                 const url = new URL(part);
//                 if (url.protocol !== "http:" && url.protocol !== "https:") {
//                     return null;
//                 }
//             } catch {
//                 return null;
//             }
//         }
//         confidence += 5;
//         reasons.push("All values are valid http(s) URLs (+5)");

//         const { matched, reason } = matchesEnvKey(name, URL_LIST_KEYS);
//         console.log("urlListRule", name, matched, reason);
//         if (matched) {
//             confidence += 2;
//             reasons.push(`${reason} (+2)`);
//         }

//         return {
//             schema: `urlListSchema("${name}")`,
//             importedSchema: "urlListSchema",
//             confidence,
//             reasons,
//         };
//     },
// };
