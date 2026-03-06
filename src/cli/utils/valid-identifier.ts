import { InferReportVarEntry } from "../../infer/report.types.js";

export const toValidIdentifier = (name: string, reportEntry: InferReportVarEntry | undefined = undefined): string => {
    // check if the variable name is a valid identifier
    const isValidIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
    const safeKey = isValidIdentifier ? name : JSON.stringify(name);
    if (!isValidIdentifier && reportEntry) {
        reportEntry.warnings.push(`Key ${name} is not a valid identifier. It has been escaped to ${safeKey}.`);
    }
    return safeKey;
};
