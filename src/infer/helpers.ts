import { RULES } from "./index.js";

export const inferSimpleSchemaForListItem = (name: string, rawValue: string): string => {
    for (const pass of RULES) {
        const result = pass.tryInfer({ name, rawValue });

        if (!result) continue;

        if (result.confidence >= pass.threshold) {
            return result.generated.code;
        }
    }

    return "z.string()";
};

const tokenizeEnvName = (name: string): string[] => name.toUpperCase().split(/[_\-]/);

export const matchesEnvKey = (name: string, keys: string[]) => {
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
