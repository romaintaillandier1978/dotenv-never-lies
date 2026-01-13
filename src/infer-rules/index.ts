import { booleanRule } from "./boolean.js";
import { durationRule } from "./duration.js";
import { jsonRule } from "./json.js";
import { keyValueListRule, keyValueRule, listRule } from "./list.js";
import { portRule } from "./port.js";
import { emailRule, numberRule, stringRule } from "./basic.js";
import { urlRule } from "./url.js";
import { ipRule, versionRule } from "./dotted.js";

export type InferenceResult = {
    /**
     * Code TS sérialisé, ex:
     * "z.string()"
     * "jsonSchema(\"${name}\")"
     */
    schema: string;
    /**
    nom exact de l'élément à importer au top du fichier env.dnl.tsgénéré, ex: "jsonSchema" 
     */
    importedSchemas: Array<string>;
    /**
     * Niveau de confiance (0–10 typiquement)
     */
    confidence: number;
    /**
     * Optionnel, pour debug / warnings futurs
     */
    reasons?: string[];
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

export const inferencePasses: InferencePass[] = [
    jsonRule, // 10
    keyValueListRule, // 9
    keyValueRule, // 8
    listRule, // 7
    portRule, //7
    durationRule, // 6
    booleanRule, // 6
    ipRule, // 5.5
    versionRule, // 5
    urlRule, // 5
    emailRule, // 4
    numberRule, // 3

    stringRule, // 0 = fallback
].sort((a, b) => b.priority - a.priority);

export const listInferencePasses: InferencePass[] = [portRule, numberRule, emailRule, urlRule, stringRule];

export const matchesEnvKey = (name: string, keys: string[]): { matched: boolean; reason: string } => {
    for (const key of keys) {
        if (name.toUpperCase().includes(key.toUpperCase())) {
            return {
                matched: true,
                reason: `Env name contains key: ${key}`,
            };
        }
    }
    return {
        matched: false,
        reason: "No hint in the Env name",
    };
};
