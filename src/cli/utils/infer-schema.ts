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

const secretMarkers = ["SECRET", "KEY", "TOKEN", "PASSWORD", "PASS", "AUTH"];

export const guessSecret = (value: string) => {
    const parts = value.toUpperCase().split(/[_\-]/);
    return secretMarkers.some((marker) => parts.includes(marker));
};
