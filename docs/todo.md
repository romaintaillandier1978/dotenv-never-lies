## TODO :

- vérifier les expands lors de l'export.

- supprimer sample
- ajouter une remarque personnelle sur vrai vécu, gros projet avec 150 variables d'environnement

- INFERENCE
    - vérifer les priorité d'inférences.
    - doc inférence philosophie
    - ajouter un warning en cas de doublons dans infer
    - schema version ok, mais ajouter l'inférence.

- tests de non regression sur l'inférence.

### readme inférence :

1. Inference rules

Inference rules are internal to DNL and not configurable.

This is a deliberate design choice to guarantee:
• determinism
• reproducibility
• documentation consistency

If you need domain-specific behavior, use presets or edit the generated schema.

2. No path schéma (and probably never)
   explain why

3. infer réduit l'ambiguité avant d'imposer la rigueur

## à réfléchir

- injecter un 'vrai' type sérialisable en .d.ts
  exemple :

```ts
  NODE_CORS_ORIGIN: {
        description: "URLs frontend autorisées à appeler cette API",
        schema: z.string().transform((v) =>
            v
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((url) => z.url().parse(url))
        ),
        outputDts : "string[]" // <= bonne idée ?
        serializeBack : ((value:string[]) => value.join(";")) // <= bonne idée ? NON : extensibilité !
    },
```

- j'ai deux mécanismes :

dnl export
=> export des truc avec les valeurs
sauf dnl export types (-> \*.d.ts)
dnl generate
=> créé un template de .env sans les valeurs (-> .env vide)

c'est pas symétrique.
