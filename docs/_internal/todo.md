## TODO :

- supprimer sample
- ajouter une remarque personnelle sur vrai vécu, gros projet avec 150 variables d'environnement

- tests de non regression sur l'inférence.

- doc : parler du preload dotenv :
  `node -r dotenv/config your_script.js`

- liste de preset :
    - open ai / other LLM

- regarder mieux et utiliser type-fest !

- dnl init : option --no-comment, option --compact

- tester le refacto des variables d'env ! => C'est merdeux !

- cli completion

- utiliser ca annotate => src/ast-tools/process-env-usage-collector.ts :
- doc de infer, parler du rapport, parler de l'inférence process.env fallback

- lors de l'inférence, rechercher les variables process.env.VAR. les injecter en commentaire dans le schéma DNL.

- process check pour le githook
- annotate : --warn-as-error --silent-warn
- --verbose + report

- enregistrer les fichiers d'entrées/sorties dans une conf de dnl. (env.dnl.ts, env.dnl.d.ts, asserter)

### readme inférence :

2. No path schéma (and probably never)
   explain why

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
