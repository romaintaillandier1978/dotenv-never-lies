export const inferSchema = (value: string | undefined) => {
    if (!value) {
        return "z.string().optional()";
    }

    if (/^(true|false)$/i.test(value)) {
        return "z.coerce.boolean()";
    }

    if (!isNaN(Number(value))) {
        return "z.coerce.number()";
    }

    try {
        new URL(value);
        return "z.string().url()";
    } catch {}

    if (/^[^@]+@[^@]+\.[^@]+$/.test(value)) {
        return "z.string().email()";
    }

    return "z.string()";
};

const secretSuffixes = ["_SECRET", "_KEY", "_TOKEN", "_PASSWORD", "_AUTH"];

export const guessSecret = (value: string) => {
    return secretSuffixes.some((suffix) => value.endsWith(suffix));
};
