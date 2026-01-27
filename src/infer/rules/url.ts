import {
    looksLikeUrl,
    looksLikeHttpUrl,
    looksLikeDbUrl,
    looksLikeQueueUrl,
    looksLikeWsUrl,
    looksLikeStorageUrl,
    looksLikeOtherUrl,
} from "../../schemas/urls.js";
import { GeneratedSchema, InferResult, InferRule } from "../rules.types.js";
import { matchesEnvKey } from "../helpers.js";
import { databaseUrlGenSchema, httpUrlGenSchema, otherUrlGenSchema, queueUrlGenSchema, storageUrlGenSchema, wsUrlSchemaGen } from "../generated/url.js";
import { zUrlGenSchema } from "../generated/basic.js";

export const URL_KEYS: string[] = ["URL", "URI", "LINK", "ENDPOINT", "API_URL", "API_ENDPOINT", "API_LINK", "API_URI"];
const DB_KEYS = ["DB", "DATABASE", "DB_URL", "DATABASE_URL", "DB_URI", "DATABASE_URI"];
const QUEUE_KEYS = ["QUEUE", "MESSAGE_QUEUE", "MESSAGE_QUEUE_URL", "MESSAGE_QUEUE_URI", "MESSAGE_QUEUE_LINK", "MESSAGE_QUEUE_ENDPOINT"];
const WS_KEYS = ["WS", "WEBSOCKET", "WEBSOCKET_URL", "WEBSOCKET_URI", "WEBSOCKET_LINK", "WEBSOCKET_ENDPOINT"];
const STORAGE_KEYS = ["STORAGE", "STORAGE_URL", "STORAGE_URI", "STORAGE_LINK", "STORAGE_ENDPOINT"];
const OTHER_KEYS = ["OTHER", "MISC", "MISC_URL", "MISC_URI", "MISC_LINK", "MISC_ENDPOINT"];

type SubUrlConst = {
    message: string;
    keys: string[];
    schema: GeneratedSchema<"url">;
};

type SubUrlContext = {
    name: string;
    rawValue: string;
    confidence: number;
    reasons: string[];
};

type SubUrlRuleInput = SubUrlConst & SubUrlContext;

const subUrlRule = (input: SubUrlRuleInput): InferResult<"url"> | null => {
    input.confidence += 2;
    input.reasons.push(`Valid ${input.message} URL (+2)`);
    const { matched, reason } = matchesEnvKey(input.name, input.keys);
    if (matched) {
        input.confidence += 2;
        input.reasons.push(`${reason} (+2)`);
    }
    return {
        generated: input.schema,
        confidence: input.confidence,
        reasons: input.reasons,
    };
};

const subUrlRules: Record<string, (name: string) => SubUrlConst> = {
    HTTP: (name: string) => {
        return {
            message: "http",
            keys: URL_KEYS,
            schema: httpUrlGenSchema(name),
        };
    },
    DATABASE: (name: string) => {
        return {
            message: "database",
            keys: DB_KEYS,
            schema: databaseUrlGenSchema(name),
        };
    },
    QUEUE: (name: string) => {
        return {
            message: "queue",
            keys: QUEUE_KEYS,
            schema: queueUrlGenSchema(name),
        };
    },
    WS: (name: string) => {
        return {
            message: "ws",
            keys: WS_KEYS,
            schema: wsUrlSchemaGen(name),
        };
    },
    STORAGE: (name: string) => {
        return {
            message: "storage",
            keys: STORAGE_KEYS,
            schema: storageUrlGenSchema(name),
        };
    },
    OTHER: (name: string) => {
        return {
            message: "other",
            keys: OTHER_KEYS,
            schema: otherUrlGenSchema(name),
        };
    },
};
export const urlRule: InferRule<"url"> = {
    meta: {
        kind: "url",
        priority: 5,
        threshold: 5,
    },
    tryInfer({ name, rawValue }) {
        if (!looksLikeUrl(rawValue)) return null;

        let confidence = 5;
        const reasons: string[] = ["Valid URL (+5)"];

        const { matched, reason } = matchesEnvKey(name, URL_KEYS);
        if (matched) {
            confidence += 2;
            reasons.push(`${reason} (+2)`);
        }

        const partial: SubUrlContext = { name, rawValue, confidence, reasons };

        if (looksLikeHttpUrl(rawValue)) return subUrlRule({ ...partial, ...subUrlRules.HTTP(name) });
        if (looksLikeDbUrl(rawValue)) return subUrlRule({ ...partial, ...subUrlRules.DATABASE(name) });
        if (looksLikeQueueUrl(rawValue)) return subUrlRule({ ...partial, ...subUrlRules.QUEUE(name) });
        if (looksLikeWsUrl(rawValue)) return subUrlRule({ ...partial, ...subUrlRules.WS(name) });
        if (looksLikeStorageUrl(rawValue)) return subUrlRule({ ...partial, ...subUrlRules.STORAGE(name) });
        if (looksLikeOtherUrl(rawValue)) return subUrlRule({ ...partial, ...subUrlRules.OTHER(name) });

        return {
            generated: zUrlGenSchema,
            confidence,
            reasons,
        };
    },
};
