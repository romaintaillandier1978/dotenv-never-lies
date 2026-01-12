import { booleanRule } from "./boolean.js";
import { durationRule } from "./duration.js";
import { jsonRule } from "./json.js";
import { keyValueListRule, keyValueRule, listRule } from "./list.js";
import { portRule } from "./port.js";
import { filenameRule, filePathRule, pathRule } from "./path.js";
import { emailRule, numberRule, urlRule, stringRule } from "./simple.js";

export type InferenceResult = {
    /**
     * Code TS sérialisé, ex:
     * "z.string()"
     * "jsonSchema(\"MY_VAR\")"
     */
    schema: string;
    /**
    nom exact de l'élément à importer au top du fichier env.dnl.tsgénéré
     */
    importedSchema?: string;
    /**
     * Niveau de confiance (0–10 typiquement)
     */
    confidence: number;
    /**
     * Optionnel, pour debug / warnings futurs
     */
    reason?: string;
};

export type InferenceInput = {
    name: string;
    rawValue: string;
};

export type InferencePass = {
    /**
     * Identifiant logique (json, boolean, duration, etc.)
     */
    type: string;

    /**
     * Ordre global (plus haut = plus prioritaire)
     */
    priority: number;

    /**
     * Seuil minimum pour accepter cette inférence
     */
    threshold: number;

    /**
     * Tente une inférence.
     * Retourne null si la règle ne s'applique pas du tout.
     */
    tryInfer(input: InferenceInput): InferenceResult | null;
};

// ⚠️ Règle d’or :
// JSON avant list,
// duration avant number,
// boolean avant enum,
// path après list

export const inferencePasses: InferencePass[] = [
    jsonRule,
    keyValueListRule,
    keyValueRule,
    listRule,
    portRule,
    durationRule,
    booleanRule,
    filePathRule,
    pathRule,
    filenameRule,
    numberRule,
    urlRule,
    emailRule,
    stringRule,
].sort((a, b) => b.priority - a.priority);

export const matchesEnvKey = (name: string, keys: string[]): boolean => {
    return keys.some((suffix) => suffix && name.includes(suffix));
};
