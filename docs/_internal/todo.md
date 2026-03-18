## TODO :

- supprimer sample
- supprimer la dependance vers dnl-export-dummy
- supprimer package.json.dnl.exports
- ajouter une remarque personnelle sur vrai vécu, gros projet avec 150 variables d'environnement

- doc : parler du preload dotenv :
  `node -r dotenv/config your_script.js`

- liste de preset :
    - open ai / other LLM
    - Jest -> NODE_ENV, CI
    - Auth0 -> AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
    - Docker -> PORT, HOST, NODE_ENV

- regarder mieux et utiliser type-fest !

- dnl init : option --no-comment

- tester le refacto des variables d'env ! => C'est merdeux !

- cli completion

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
