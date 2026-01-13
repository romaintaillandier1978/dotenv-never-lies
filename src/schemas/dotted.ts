import { z } from "zod";

const ipV4Regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
const ipV6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

export const looksLikeIp = (value: string) => {
    return ipV4Regex.test(value) || ipV6Regex.test(value);
};
/**
 * Creates a Zod schema for a IP address. (simple V4 address: 0.0.0.0 or V6 address: 0000:0000:0000:0000:0000:0000:0000:0000).
 * compressed ip addresses like ::ffff:192.0.2.1 are not supported.
 * @param name - The name of the environment variable.
 * @returns A Zod schema for a IP address.
 */
export const ipSchema = (name: string): z.ZodType<string> => {
    return z.string().transform((v, ctx) => {
        if (!looksLikeIp(v)) {
            ctx.addIssue({ code: "custom", message: `${name} has invalid IP value: "${v}"` });
            return z.NEVER;
        }
        return v;
    });
};

/** semver 1.2.3 let it be simple !  no suffixes like -beta, -rc, etc.*/
const VERSION_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export const looksLikeVersion = (value: string) => {
    return VERSION_REGEX.test(value);
};

// Note : NEVER add 2 parts version (2.0), it will conflict with numberRules (numberSchema)

/**
 * Creates a Zod schema for a version. Only semver 1.2.3 are supported.
 * suffixes (like -beta, -rc, etc.) are not supported
 * 2 parts versions (like 2.0, 3.0, etc.) are not supported
 * 4 parts versions (like 1.2.3.4, 1.2.3.4.5, etc.) are not supported
 * v prefix (like v1.2.3, v2.0, v3.0, etc.) are not supported
 * @param name - The name of the environment variable.
 * @returns A Zod schema for a version.
 */
export const versionSchema = (name: string): z.ZodType<string> => {
    return z.string().transform((v, ctx) => {
        if (!looksLikeVersion(v)) {
            ctx.addIssue({ code: "custom", message: `${name} has invalid versionvalue: "${v}"` });
            return z.NEVER;
        }
        return v;
    });
};
