export type SecretResult = {
    isSecret: boolean;
    reasons: Array<string>;
};

export const fallbackSecretResult: SecretResult = {
    isSecret: false,
    reasons: [],
};
