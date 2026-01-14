export type InferResult = {
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

export type InferInput = {
    name: string;
    rawValue: string;
};

export type InferRule = {
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
    tryInfer(input: InferInput): InferResult | null;
};
