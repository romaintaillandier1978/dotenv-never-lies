import { looksLikeUrl, looksLikeHttpUrl, looksLikeDbUrl, looksLikeQueueUrl, looksLikeWsUrl, looksLikeStorageUrl, looksLikeOtherUrl } from "../schemas/urls.js";
import { InferenceInput, InferencePass, InferenceResult, matchesEnvKey } from "./index.js";

export const URL_KEYS: string[] = ["URL", "URI", "LINK", "ENDPOINT", "API_URL", "API_ENDPOINT", "API_LINK", "API_URI"];
const DB_KEYS = ["DB", "DATABASE", "DB_URL", "DATABASE_URL", "DB_URI", "DATABASE_URI"];
const QUEUE_KEYS = ["QUEUE", "MESSAGE_QUEUE", "MESSAGE_QUEUE_URL", "MESSAGE_QUEUE_URI", "MESSAGE_QUEUE_LINK", "MESSAGE_QUEUE_ENDPOINT"];
const WS_KEYS = ["WS", "WEBSOCKET", "WEBSOCKET_URL", "WEBSOCKET_URI", "WEBSOCKET_LINK", "WEBSOCKET_ENDPOINT"];
const STORAGE_KEYS = ["STORAGE", "STORAGE_URL", "STORAGE_URI", "STORAGE_LINK", "STORAGE_ENDPOINT"];
const OTHER_KEYS = ["OTHER", "MISC", "MISC_URL", "MISC_URI", "MISC_LINK", "MISC_ENDPOINT"];

type SubUrlConst = {
    message: string;
    keys: string[];
    schema: string;
    importedSchemas: string[];
};
type SubUrlRuleInput = SubUrlConst & {
    name: string;
    rawValue: string;
    confidence: number;
    reasons: string[];
};

const subUrlRule = (input: SubUrlRuleInput): InferenceResult | null => {
    input.confidence += 2;
    const reasons: string[] = [`Valid ${input.message} URL (+2)`];
    const { matched, reason } = matchesEnvKey(input.name, input.keys);
    if (matched) {
        input.confidence += 2;
        reasons.push(`${reason} (+2)`);
    }
    return {
        schema: input.schema,
        importedSchemas: input.importedSchemas,
        confidence: input.confidence,
        reasons,
    };
};

const subUrlRules: Record<string, (name: string) => SubUrlConst> = {
    HTTP: (name: string) => {
        return {
            message: "HTTP",
            keys: URL_KEYS,
            schema: `httpUrlSchema(${JSON.stringify(name)})`,
            importedSchemas: ["httpUrlSchema"],
        };
    },
    DATABASE: (name: string) => {
        return {
            message: "database",
            keys: DB_KEYS,
            schema: `databaseUrlSchema(${JSON.stringify(name)})`,
            importedSchemas: ["databaseUrlSchema"],
        };
    },
    QUEUE: (name: string) => {
        return {
            message: "queue",
            keys: QUEUE_KEYS,
            schema: `queueUrlSchema(${JSON.stringify(name)})`,
            importedSchemas: ["queueUrlSchema"],
        };
    },
    WS: (name: string) => {
        return {
            message: "ws",
            keys: WS_KEYS,
            schema: `wsUrlSchema(${JSON.stringify(name)})`,
            importedSchemas: ["wsUrlSchema"],
        };
    },
    STORAGE: (name: string) => {
        return {
            message: "storage",
            keys: STORAGE_KEYS,
            schema: `storageUrlSchema(${JSON.stringify(name)})`,
            importedSchemas: ["storageUrlSchema"],
        };
    },
    OTHER: (name: string) => {
        return {
            message: "other",
            keys: OTHER_KEYS,
            schema: `otherUrlSchema(${JSON.stringify(name)})`,
            importedSchemas: ["otherUrlSchema"],
        };
    },
};
export const urlRule: InferencePass = {
    type: "url",
    priority: 5,
    threshold: 5,

    tryInfer({ name, rawValue }) {
        if (!looksLikeUrl(rawValue)) return null;

        let confidence = 5;
        const reasons: string[] = ["Valid URL (+5)"];

        const { matched, reason } = matchesEnvKey(name, URL_KEYS);
        if (matched) {
            confidence += 2;
            reasons.push(`${reason} (+2)`);
        }

        if (looksLikeHttpUrl(rawValue)) {
            return subUrlRule({
                name,
                rawValue,
                confidence,
                reasons,
                ...subUrlRules.HTTP(name),
            });
        }
        if (looksLikeDbUrl(rawValue)) {
            return subUrlRule({
                name,
                rawValue,
                confidence,
                reasons,
                ...subUrlRules.DATABASE(name),
            });
        }
        if (looksLikeQueueUrl(rawValue)) {
            return subUrlRule({
                name,
                rawValue,
                confidence,
                reasons,
                ...subUrlRules.QUEUE(name),
            });
        }
        if (looksLikeWsUrl(rawValue)) {
            return subUrlRule({
                name,
                rawValue,
                confidence,
                reasons,
                ...subUrlRules.WS(name),
            });
        }
        if (looksLikeStorageUrl(rawValue)) {
            return subUrlRule({
                name,
                rawValue,
                confidence,
                reasons,
                ...subUrlRules.STORAGE(name),
            });
        }
        if (looksLikeOtherUrl(rawValue)) {
            return subUrlRule({
                name,
                rawValue,
                confidence,
                reasons,
                ...subUrlRules.OTHER(name),
            });
        }

        return {
            schema: "z.url()",
            importedSchemas: [],
            confidence,
            reasons,
        };
    },
};
