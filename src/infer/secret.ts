import { matchesEnvKey } from "./helpers.js";
import { SecretResult } from "./secret.types.js";

const SECRET_KEYS = ["SECRET", "KEY", "TOKEN", "PASSWORD", "PASS", "AUTH"];

export const guessSecretRule = (name: string): SecretResult => {
    const reasons: string[] = [];

    const { matched, reason } = matchesEnvKey(name, SECRET_KEYS);
    if (matched) {
        reasons.push(reason);
    }
    return { isSecret: matched, reasons };
};
