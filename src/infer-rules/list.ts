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

        let confidence = 6;

        if (matchesEnvKey(name, KEY_PAIR_NAMES_LIST)) {
            confidence += 1;
        }

        return {
            schema: `keyValueListSchema("${name}")`,
            importedSchema: "keyValueListSchema",
            confidence,
            reason: "multiple key=value pairs detected",
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

        let confidence = 4;

        if (matchesEnvKey(name, KEY_PAIR_NAMES)) {
            confidence += 1;
        }

        return {
            schema: `keyValueSchema("${name}")`,
            importedSchema: "keyValueSchema",
            confidence,
            reason: "single key=value structure",
        };
    },
};

const LIST_KEYS = ["_LIST", "_ITEMS", "_ARRAY", "_VALUES"];

export const listRule: InferencePass = {
    type: "list",
    priority: 7,
    threshold: 5,

    tryInfer({ name, rawValue }) {
        if (rawValue.startsWith("{") || rawValue.startsWith("[")) return null;
        if (rawValue.includes("=")) return null;

        let confidence = 0;

        const semicolonItems = rawValue.split(";").filter(Boolean);
        const commaItems = rawValue.split(",").filter(Boolean);

        if (semicolonItems.length > 1) confidence += 4;
        if (commaItems.length > 1) confidence += 4;

        if (matchesEnvKey(name, LIST_KEYS)) {
            confidence += 1;
        }

        if (confidence < this.threshold) return null;
        // TODO !
        // simpleRule({name, rawValue}) pour chaque valeurs.
        //  a partir de la on sait que c'est une liste.
        // Il faudrait un appel récursif pour voir si c'est une liste d'un type plus complexe.
        // Mais on va limiter

        return {
            schema: `listSchema("${name}")`,
            importedSchema: "listSchema",
            confidence,
            reason: "multiple values separated by delimiter",
        };
    },
};
