import { z } from "zod";

export const looksLikeUrl = (value: string): boolean => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

const HTTP_PROTOCOLS = ["http:", "https:"];
const DB_PROTOCOLS = [
    "postgres:",
    "postgresql:",
    "mysql:",
    "mariadb:",
    "mongodb:",
    "mongodb+srv:",
    "redis:",
    "rediss:",
    "cassandra:",
    "mssql:",
    "sqlserver:",
    "oracle:",
    "cockroachdb:",
    "sqlite:",
];
const QUEUE_PROTOCOLS = ["amqp:", "amqps:", "mqtt:", "mqtt+ws:", "mqtt+wss:", "stomp:", "stomp+ssl:", "stomp+ws:", "stomp+wss:"];
const WS_PROTOCOLS = ["ws:", "wss:"];
const STORAGE_PROTOCOLS = ["s3:", "gs:", "azure:", "azblob:", "file:", "ftp:", "ftps:", "sftp:"];
const OTHER_PROTOCOLS = ["ldap:", "ldaps:", "smtp:", "smtps:", "imap:", "imaps:", "pop3:", "pop3s:", "git:", "ssh:", "tcp:", "udp:"];

const makeUrlLooksLike = (protocols: string[]): ((value: string) => boolean) => {
    return (value: string) => protocols.some((protocol) => new URL(value).protocol === protocol);
};

// Remark.
// here each schema do a double url verification :
// once in z.url(), once in looksLikeXUrl() with new URL().

const makeUrlSchema =
    (message: string, looksLike: (value: string) => boolean) =>
        (name: string): z.ZodURL => {
            return z
                .url()
                .refine(
                    (v) => {
                        try {
                            return looksLike(v.toString());
                        } catch {
                            return false;
                        }
                    },
                    {
                        message: `${name} has invalid ${message} URL`,
                    }
                );
        };

export const looksLikeHttpUrl = makeUrlLooksLike(HTTP_PROTOCOLS);
export const looksLikeDbUrl = makeUrlLooksLike(DB_PROTOCOLS);
export const looksLikeQueueUrl = makeUrlLooksLike(QUEUE_PROTOCOLS);
export const looksLikeWsUrl = makeUrlLooksLike(WS_PROTOCOLS);
export const looksLikeStorageUrl = makeUrlLooksLike(STORAGE_PROTOCOLS);
export const looksLikeOtherUrl = makeUrlLooksLike(OTHER_PROTOCOLS);

export const httpUrlSchema = makeUrlSchema("HTTP", looksLikeHttpUrl);
export const databaseUrlSchema = makeUrlSchema("database", looksLikeDbUrl);
export const queueUrlSchema = makeUrlSchema("queue", looksLikeQueueUrl);
export const wsUrlSchema = makeUrlSchema("WebSocket", looksLikeWsUrl);
export const storageUrlSchema = makeUrlSchema("storage", looksLikeStorageUrl);
export const otherUrlSchema = makeUrlSchema("other", looksLikeOtherUrl);
