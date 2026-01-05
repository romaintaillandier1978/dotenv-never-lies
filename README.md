# dotenv-never-lies

> Parce que les variables d’environnement **mentent tout le temps**.

**dotenv-never-lies** valide, type et documente tes variables d’environnement à partir d’un schéma TypeScript / Zod.  
Il échoue **vite**, **fort**, et **avant la prod**.

## Pourquoi ?

Parce que tout ça arrive **tout le temps** :

- ❌ une variable d’env manquante → **crash au runtime**
- ❌ une URL mal formée → **bug subtil en prod**
- ❌ la CI n’a pas été mise à jour après une nouvelle variable → **déploiement rouge incompréhensible**
- ❌ un `process.env.FOO!` optimiste → **mensonge à toi-même**

Et parce que `.env` est :

- non typé
- non documenté
- partagé à la main
- rarement à jour

👉 **dotenv-never-lies** transforme cette configuration fragile en **contrat explicite**.

---

## Ce que fait la lib

- ✅ valide les variables d’environnement au démarrage
- ✅ fournit un typage TypeScript fiable
- ✅ documente chaque variable
- ✅ expose un CLI pour la CI et les humains
- ✅ permet des transformations complexes (arrays, parsing, coercion…)

---

## Ce que dotenv-never-lies n’est pas

Ce package a un périmètre volontairement **limité**.

- ❌ **Ce n’est pas un outil frontend**  
  Il n’est pas destiné à être utilisé dans un navigateur.  
  Pas de bundler, pas de `import.meta.env`, pas de variables exposées au client.

- ❌ **Ce n’est pas un gestionnaire de secrets**  
  Il ne chiffre rien, ne stocke rien, ne remplace ni Vault, ni AWS Secrets Manager,
  ni les variables sécurisées de ton provider CI/CD.

- ❌ **Ce n’est pas une solution cross-runtime**  
  Support ciblé : **Node.js**.  
  Deno, Bun, Cloudflare Workers, edge runtimes : hors scope (pour l’instant).

- ❌ **Ce n’est pas un framework de configuration global**  
  Il ne gère ni les fichiers YAML/JSON, ni les profils dynamiques,
  ni les overrides magiques par environnement.

- ❌ **Ce n’est pas permissif**  
  S’il manque une variable ou qu’une valeur est invalide, ça plante.  
  C’est le but.

En résumé :  
**dotenv-never-lies** est fait pour des **APIs Node.js** et des **services backend**  
qui préfèrent **échouer proprement au démarrage** plutôt que **bugger silencieusement en prod**.

---

## Installation

```bash
npm install @romaintaillandier1978/dotenv-never-lies
# ou
yarn add @romaintaillandier1978/dotenv-never-lies
```

## Dépendances et compatibilité

**[`zod`](https://www.npmjs.com/package/zod)**, dotenv-never-lies expose des schémas Zod dans son API publique.

⚠️ _Important : Zod **v4.2.1** minimum est requis._
Utiliser Zod v3 entraînera des erreurs de typage ou d’inférence.

**[`dotenv`](https://www.npmjs.com/package/dotenv)** permet à dotenv-never-lies de gérer automatiquement le parsing des fichiers env

**[`dotenv-expand`](https://www.npmjs.com/package/dotenv-expand)** permet à dotenv-never-lies de gérer automatiquement l’expansion des variables d’environnement. Cela permet de définir des variables composées à partir d’autres variables, sans duplication ni copier-coller fragile.

**Exemple**

```env
FRONT_A=https://a.site.com
FRONT_B=https://b.site.com
FRONT_C=https://c.site.com

NODE_CORS_ORIGIN="${FRONT_A};${FRONT_B};${FRONT_C}"
```

## Schéma DNL

Le schéma DNL est ta nouvelle source de vérité.

(`dnl reverse-env` t'aidera à faire le premier squelette)

### emplacement du schéma

Recommandé : env.dnl.ts

Supporté dans cet ordre pour toutes les commandes CLI :

1. --schema path/to/my-dnl.ts
2. déclaré dans le package.json :

```json
{
    ...
    "dotenv-never-lies": {
        "schema": "path/to/my-dnl.ts"
    }
    ...
}
```

3. un des "env.dnl.ts", "env.dnl.js", "dnl.config.ts", "dnl.config.js"

### définir un schéma

```typescript
import { z } from "zod";
import { define } from "@romaintaillandier1978/dotenv-never-lies";

export default define({
    NODE_ENV: {
        description: "Environnement d’exécution",
        schema: z.enum(["test", "development", "staging", "production"]),
    },

    NODE_PORT: {
        description: "Port de l’API",
        schema: z.coerce.number().default(3000),
    },

    FRONT_URL: {
        description: "Mon site",
        schema: z.url(),
    },

    JWT_SECRET: {
        description: "JWT Secret",
        schema: z.string(),
        secret: true,
    },
});
```

## Gestion des secrets

Rappel : dotenv-never-lies n’est pas un secret manager.

### déclaration dans le schéma DNL

Une variable est considérée comme secrète _si et seulement si elle est marquée explicitement_ dans le schéma avec `secret: true`. (`secret : undefined` est équivalent à `secret: false`)  
Cette règle est volontairement stricte.

```ts
JWT_SECRET: {
    description: "Clé de signature des JWT",
    schema: z.string(),
    secret: true,
}
```

### Secrets et commandes CLI

assert : valide les secrets comme n’importe quelle variable

reverse-env : lors de la génération du schéma, la commande tente d’identifier automatiquement les variables sensibles (ex. SECRET, KEY, TOKEN, PASSWORD).
**Cette détection est heuristique et doit toujours être vérifiée et corrigée manuellement.**

export : adapte le comportement selon le format cible (env, docker, CI, Kubernetes…). Voir le tableau ci-dessous pour le détail par format.

### Lors de l’export

Les variables marquées `secret: true` dans le schéma sont traitées différemment selon le format d’export.

| Format        | Secrets inclus par défaut | Masquables (`--hide-secret`) | Excluables (`--exclude-secret`) | Remarques                    |
| ------------- | ------------------------- | ---------------------------- | ------------------------------- | ---------------------------- |
| env           | oui                       | oui                          | oui                             | .env classique               |
| docker-env    | oui                       | oui                          | oui                             | Pour --env-file              |
| docker-args   | oui                       | oui                          | oui                             | Pour docker run -e           |
| json          | oui                       | oui                          | oui                             | Debug / tooling              |
| ts            | oui                       | oui                          | oui                             | Export typé                  |
| js            | oui                       | oui                          | oui                             | Export runtime               |
| github-env    | oui                       | oui                          | oui                             | visibles dans les logs       |
| github-secret | secrets uniquement        | non                          | oui                             | Via gh secret set            |
| gitlab-env    | oui                       | oui                          | oui                             | Variables CI GitLab          |
| k8s-configmap | oui                       | oui                          | oui                             | warning si secret non masqué |
| k8s-secret    | secrets uniquement        | oui                          | oui                             | Kubernetes Secret            |

## Utilisation runtime

```typescript
import envDef from "./env.dnl";

export const ENV = envDef.load();

// if (process.env.NODE_ENV && process.env.NODE_ENV === "test") {
if (ENV.NODE_ENV === "test") {
    doAdditionalTest();
}

const server = http.createServer(app);
//server.listen(process.env.NODE_PORT||3000, () => {
server.listen(ENV.NODE_PORT, () => {
    console.log(`Server started on ${ENV.NODE_PORT}`);
});
```

Résultat :

- ENV.NODE_ENV est un enum
- ENV.NODE_PORT est un number
- FRONT_URL est une URL valides
- ENV.JWT_SECRET est une string

Si une variable est absente ou invalide → le process s’arrête immédiatement.  
C’est volontaire.

## Éviter `process.env` dans le code applicatif

Une fois le schéma chargé, l’accès aux variables d’environnement
doit se faire exclusivement via l’objet `ENV`.

Cela garantit :

- un typage strict
- des valeurs validées
- un point d’entrée unique pour la configuration

Pour identifier les usages résiduels de `process.env` dans ta base de code, un simple outil de recherche suffit :

```bash
grep -R "process\.env" src
```

Le choix de corriger (ou non) ces usages dépend du contexte et reste volontairement laissé au développeur.

## CLI

Le CLI permet de valider, charger, générer, exporter et documenter les variables d’environnement à partir d’un schéma `dotenv-never-lies`.

Il est conçu pour être utilisé :

- en local (par des humains)
- en CI (sans surprise)
- avant que l’application ne démarre (et pas après)

### Exit codes

`dotenv-never-lies` utilise des codes de sortie explicites, pensés pour la CI :

| Code | Signification                         |
| ---: | ------------------------------------- |
|    0 | Succès                                |
|    1 | Erreur d'usage ou erreur interne      |
|    2 | Schéma DNL introuvable                |
|    3 | Validation de l'environnement échouée |
|    4 | Erreur lors de l'export               |

### assert : Valider un fichier `.env` (CI-friendly)

Valide les variables sans les injecter dans `process.env`.

```bash
dnl assert --source .env --schema env.dnl.ts
```

Sans --source, `dnl assert` valide `process.env`.
C'est le mode recommandé lorsque les variables sont injectées par le runtime ou la CI.

→ échoue si :

- une variable est manquante
- une valeur est invalide
- le schéma n’est pas respecté

### generate : Générer un fichier .env à partir du schéma

Génère un .env documenté à partir du schéma.

```bash
dnl generate --schema env.dnl.ts --out .env
```

Utile pour :

- initialiser un projet
- partager un template
- éviter les .env.example obsolètes

### reverse-env : Générer un schéma depuis un .env existant

Crée un fichier env.dnl.ts à partir d’un .env.

```bash
dnl reverse-env --source .env
```

Utile pour :

- migrer un projet existant
- documenter a posteriori une configuration legacy

### explain : Afficher la documentation des variables

Affiche la liste des variables connues et leur description.

```bash
dnl explain
```

Exemple de sortie :

```bash
FRONT_A: Mon site A
FRONT_B: Mon site B
FRONT_C: Mon site C
NODE_CORS_ORIGIN: URLs frontend autorisées à appeler cette API
JWT_SECRET: JWT Secret

```

### export : Exporter les variables vers d’autres formats

La commande export permet de transformer les variables validées par le schéma
en formats directement exploitables par d’autres outils (Docker, CI, Kubernetes, scripts…).

Le schéma reste la source de vérité.
Les valeurs sont validées avant export.

```bash
dnl export <format>
```

Par défaut, les valeurs sont lues depuis process.env.
Un fichier .env peut être fourni via --source.

Exemples :  
Exporter les variables d'environnement au format JSON depuis un fichier .env

```bash
dnl export json --source .env
```

Nettoyer un fichier .env (retirer commentaires et lignes inutiles)

```bash
dnl export env --source .env --out .env.clean
dnl export env --source .env --out .env --force
```

Exporter les variables au format docker-args

```bash
dnl export docker-args --source .env
```

Résultat :

```bash
-e "NODE_ENV=production" -e "NODE_PORT=3000"
```

Exporter pour GitHub Actions (variables)

```bash
dnl export github-env
```

Résultat :

```bash
echo "NODE_ENV=production" >> $GITHUB_ENV
echo "NODE_PORT=3000" >> $GITHUB_ENV
```

Il existe encore quelques autres formats et options (voir la doc CLI `dnl export --help`)

## Usages dans la vraie vie

### GitIgnore

dotenv-never-lies crée des fichiers temporaires dans ton répertoire projet.
Ajoute `.dnl/` à ton `.gitignore`.

### Git

#### Git hooks recommandés

Il est fortement conseillé d’utiliser **dotenv-never-lies** via des hooks Git :

- **pre-commit** : empêche de committer si la configuration locale n’est pas conforme au schéma
- **post-merge** : détecte immédiatement les changements de schéma impactant l’environnement local

L’objectif est simple :  
**si la configuration locale n’est pas conforme au schéma, le code ne doit pas être committé.**

Le schéma est la source de vérité, pas les fichiers `.env`.

Ces hooks permettent d’éviter les erreurs classiques :

- variable manquante après un pull
- format invalide détecté trop tard
- “ça marche chez moi” dû à un `.env` obsolète

#### Installation des hooks

```bash
git config core.hooksPath .githooks
mkdir -p .githooks

cat > .githooks/pre-commit <<'EOF'
#!/bin/sh
yarn dnl assert --source .env
EOF

cat > .githooks/post-merge <<'EOF'
#!/bin/sh
yarn dnl assert --source .env || true
EOF

chmod +x .githooks/pre-commit .githooks/post-merge
```

### Gitlab CI

Step de validation des variables d'environnement.

```yaml
# .gitlab-ci.yml
check-env:
    stage: test
    image: node:20-alpine
    script:
        - corepack enable
        - yarn install --frozen-lockfile
        - yarn dnl assert --source $DOT_ENV_FILE
```

### GitHub Actions

```yaml
# .github/workflows/check-env.yml
name: Check environment

on: [push, pull_request]

jobs:
    check-env:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - uses: actions/setup-node@v4
              with:
                  node-version: 20

            - run: corepack enable
            - run: yarn install --frozen-lockfile

            # Exemple avec un fichier .env fourni par un secret
            - run: yarn dnl assert --source .env
```

Le fichier .env peut être généré à partir d’un secret GitHub ou monté dynamiquement.

```yaml
- run: echo "$ENV_FILE_CONTENT" > .env
  env:
      ENV_FILE_CONTENT: ${{ secrets.ENV_FILE }}
```

### Quelles commandes utiliser ?

|                                 Situation | Commande à utiliser            |
| ----------------------------------------: | ------------------------------ |
|                            Nouveau projet | generate                       |
|              Projet existant avec un .env | reverse-env                    |
|            Valider la configuration en CI | assert                         |
| Valider la config injectée par le runtime | assert                         |
|                  Documenter les variables | explain                        |
|                    Générer un .env propre | export env                     |
|                  Préparer un build Docker | export docker-\*               |
|              Injecter des variables en CI | export github-env / gitlab-env |
|           Kubernetes (ConfigMap / Secret) | export k8s-\*                  |

Règle simple :

> Le schéma est toujours la source de vérité.  
> Les commandes ne font que valider, documenter ou transformer.

## FAQ / Choix de design

### Pourquoi être aussi strict ?

Parce que les erreurs de configuration sont des bugs, pas des warnings.

Si une variable est manquante ou invalide :

- l’application ne doit pas démarrer
- l’erreur doit être immédiate et explicite

Tolérer une config invalide revient à déplacer le bug en production.

### Pourquoi Node.js uniquement ?

Parce que le runtime cible est clair :

- APIs
- workers
- jobs
- CI

Les runtimes edge (Deno, Bun, Cloudflare Workers…) ont :

- des modèles d’environnement différents
- des contraintes différentes
- des attentes différentes

Ils sont volontairement hors scope.

### Pourquoi Zod ?

Parce que Zod fournit :

- un typage TypeScript fiable
- une validation runtime cohérente
- des transformations expressives

Le schéma est à la fois :

- documentation
- contrat
- validation
- source de typage

Aucun autre outil ne couvre ces quatre points aussi proprement aujourd’hui.

### Pourquoi ne pas utiliser dotenv-safe / env-schema / autre ?

Ces outils :

- valident partiellement
- typent peu ou mal
- ne documentent pas vraiment
- n’offrent pas de CLI cohérent

dotenv-never-lies assume un périmètre plus strict,
mais fournit une chaîne complète :
schéma → validation → typage → CI → export.

### Pourquoi ne pas gérer les secrets ?

Parce que ce n’est pas le bon niveau.

dotenv-never-lies :

- identifie les secrets
- peut les exclure, masquer ou exporter

Mais :

- ne chiffre rien
- ne stocke rien

Il s’intègre avec les outils existants, il ne les concurrence pas.

# Conclusion :

> dotenv-never-lies ne cherche pas à être flexible. Il cherche à être fiable, explicite et prévisible.
