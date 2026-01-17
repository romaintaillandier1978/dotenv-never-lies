import { GeneratedSchema } from "./types.js";

export type MatchesEnvKeyResult = { matched: boolean; reason: string };

const tokenizeEnvName = (name: string): string[] => name.toUpperCase().split(/[_\-]/);

export const matchesEnvKey = (name: string, keys: string[]): MatchesEnvKeyResult => {
    const tokens = tokenizeEnvName(name);

    // si au moins un des marker est contenu dans le nom (tokenisé et uppercasé.)
    for (const key of keys) {
        if (tokens.includes(key.toUpperCase())) {
            return { matched: true, reason: `Env name contains key: ${key}` };
        }
    }

    return { matched: false, reason: "No hint in the Env name" };
};

const SECRET_KEYS = ["SECRET", "KEY", "TOKEN", "PASSWORD", "PASS", "AUTH"];

export const guessSecret = (name: string): boolean => {
    return matchesEnvKey(name, SECRET_KEYS).matched;
};

export const areAllSameGenSchemas = (elements: GeneratedSchema[]): boolean => {
    const e0 = elements[0];
    return elements.every((e) => areSameGenSchemas(e, e0));
};

export const areSameGenSchemas = (a: GeneratedSchema, b: GeneratedSchema): boolean => {
    if (a === b) return true;
    if (a.code !== b.code) return false;
    if (a.imports.length !== b.imports.length) return false;
    return a.imports.every((i) => b.imports.some((j) => i.name === j.name && i.from === j.from));
};
