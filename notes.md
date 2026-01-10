# Readme interne

## utiliser en local,

pour créer le dotenv-never-lies-v1.0.0.tgz

```bash
npm pack
```

puis installer dans un autre projet :

```bash
yarn add /path/to/dotenv-never-lies-v1.0.0.tgz
```

## publier sur npmjs.org

checklist :

- incrémetner la version sinon : crash
- fichiers sont corrects
- bin pointe bien vers un fichier existant dans dist.
- type de module cohérent
- node >= 20
- pas de fichier poubelle

regarder ce qui va partir sur la publication : `npm pack --dry-run`

puis

```bash
npm login
yarn release:patch
npm publish
```

## nouvelle fonctionnalité LLM pour DNL :

- générer un document utilisable par l'ia dans le contexte de l'utilisateur
    - dnl export llm => Générer un artefact “LLM-friendly” pour l'outillage utilisateur qui ressemble à env.dnl.ts, pour le llm
    - normaliser / forcer les descriptions dans le schéma. sans desc => hallu
    - marquer les secret encore plus explictement {key:jwt,secret:true,exposed:false}

- rendre DNL facilement utilisable par un LLM : LLM integration Kit
    - créer des fichiers 'explication à destination des llm dans llm-kit
    - faut-il injecter ces fichier dans le projet de l'utilisateur ?
    -

- ne surtout pas faire : créer des prompts intégrés, dépendance a un llm

## Schéma zod spécialisés intégrés

- réfléchir a ajouter des types zod spécifique et faciles : - listSchema(name, ";", z.url(), { allowEmpty: true })
  dnl.boolSchema() // "true" | "false" | "1" | "0"
  dnl.jsonSchema<T>()
  dnl.intSchema()
  dnl.portSchema()
  dnl.urlListSchema(";") // sugar sur listSchema + z.url()

    dnl.base64schema
    dnl.regexSchema
    key value avec 2 niveaux de séparateur genre a=b&c=d ou a:b;c:d // fait a vérifier

## Extensibilité

- exporters, avec un model, une interface
- génériser EnvVarDefinition avec une propriété générique que DNL n'utilisera jamais.
-

## TODO :

- vérifier les expands lors de l'export.

- supprimer sample
- ajouter une remarque personnelle sur vrai vécu, gros projet avec 150 variables d'environnement
- renomer la commande cli reverse-env en infer ?

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
