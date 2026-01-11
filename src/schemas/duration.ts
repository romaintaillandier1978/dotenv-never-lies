import { z } from "zod";

const durationSuffixes = ["ms", "s", "m", "h", "d", "w", "M", "y"] as const;
type DurationSuffix = (typeof durationSuffixes)[number];
const durationSuffixesMap: Record<DurationSuffix, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    M: 30 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
};

const DURATION_REGEX_STRICT = /^(\d+)(ms|s|m|h|d|w|M|y)$/;
const MAX_DURATION = 10 * durationSuffixesMap.y; // 10y

export const looksLikeValidDuration = (value: string) => DURATION_REGEX_STRICT.test(value);

/**
 * Creates a Zod schema for a duration (e.g. 500ms, 5s, 2m).
 * unit is mandatory and must be one of the following: ms, s, m, h, d, w, M, y.
 * @param name - The name of the duration.
 * @returns A Zod schema for a duration.
 */
export const durationSchema = (name: string): z.ZodType<number> =>
    z.string().transform((v, ctx) => {
        const match = v.match(DURATION_REGEX_STRICT);
        if (!match) {
            ctx.addIssue({
                code: "custom",
                message: `${name} must be a valid duration (e.g. 500ms, 5s, 2m)`,
            });
            return z.NEVER;
        }

        const value = Number(match[1]);
        const suffix = match[2] as DurationSuffix;

        const result = value * durationSuffixesMap[suffix as DurationSuffix];
        // prevent from 999999999999y
        if (!Number.isSafeInteger(result) || result < 0 || result > MAX_DURATION) {
            ctx.addIssue({
                code: "custom",
                message: `${name} must be a valid duration (e.g. 500ms, 5s, 2m)`,
            });
            return z.NEVER;
        }
        return result;
    });
