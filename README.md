# dotenv-never-lies

> Parce que les variables d’environnement **mentent tout le temps**.

**dotenv-never-lies** valide, type et documente tes variables d’environnement à partir d’un schéma TypeScript / Zod.  
Il échoue **vite**, **fort**, et **avant la prod**.

---

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
  Il ne gère ni les fichiers YAML/JSON, ni les profiles dynamiques,
  ni les overrides magiques par environnement.

- ❌ **Ce n’est pas permissif**  
  S’il manque une variable ou qu’une valeur est invalide, ça plante.  
  C’est le but.

En résumé :  
**dotenv-never-lies** est fait pour des **APIs Node.js** et des **services backend**  
qui préfèrent **échouer proprement au démarrage** plutôt que **bugger silencieusement en prod**.

---

## Dependency warnings

⚠️ Important
dotenv-never-lies expose des schémas Zod dans son API publique.
Zod v4 est requis.
Mélanger les versions cassera l’inférence de types (et oui, ça fait mal).

## Installation

```bash
yarn add dotenv-never-lies
# ou
npm install dotenv-never-lies
```

## Expansion des variables (`dotenv-expand`)

**dotenv-never-lies** gère automatiquement l’expansion des variables d’environnement,
via [`dotenv-expand`](https://www.npmjs.com/package/dotenv-expand).

Cela permet de définir des variables composées à partir d’autres variables,
sans duplication ni copier-coller fragile.

### Exemple

```env
FRONT_A=https://a.site.com
FRONT_B=https://b.site.com
FRONT_C=https://c.site.com

NODE_CORS_ORIGIN="${FRONT_A};${FRONT_B};${FRONT_C}"
```

## Définir un schéma

env.dnl.ts

```typescript
import { z } from "zod";
import { define } from "dotenv-never-lies";

export default define({
    NODE_ENV: {
        description: "Environnement d’exécution",
        schema: z.enum(["test", "development", "staging", "production"]),
    },

    NODE_PORT: {
        description: "Port de l’API",
        schema: z.coerce.number(),
    },

    FRONT_A: {
        description: "Mon site A",
        schema: z.url(),
    },

    FRONT_B: {
        description: "Mon site B",
        schema: z.url(),
    },

    FRONT_C: {
        description: "Mon site C",
        schema: z.url(),
    },

    NODE_CORS_ORIGIN: {
        description: "URLs frontend autorisées à appeler cette API",
        schema: z.string().transform((v) =>
            v
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((url) => z.url().parse(url))
        ),
    },

    JWT_SECRET: {
        description: "JWT Secret",
        schema: z.string(),
        secret: true,
    },
});
```

## Utilisation runtime

```typescript
import envDef from "./env.dnl";

export const ENV = envDef.load();

if(ENV.NODE_ENV === "test"){...}


```

Résultat :

- ENV.NODE_ENV est un enum
- ENV.NODE_PORT est un number
- ENV.FRONT_A ENV.FRONT_B ENV.FRONT_C sont des URLs valides
- ENV.NODE_CORS_ORIGIN est un string[] contenant des URLs valides
- ENV.JWT_SECRET est une string

Si une variable est absente ou invalide → le process s’arrête immédiatement. \
C’est volontaire.

## Éviter `process.env` dans le code applicatif

Une fois le schéma chargé, l’accès aux variables d’environnement
doit se faire exclusivement via l’objet `ENV`.

Cela garantit :

- un typage strict
- des valeurs validées
- un point d’entrée unique pour la configuration

Pour identifier les usages résiduels de `process.env` dans votre codebase, un simple outil de recherche suffit :

```bash
grep -R "process\.env" src
```

Le choix de corriger (ou non) ces usages dépend du contexte et reste volontairement laissé au développeur.

## CLI

Le CLI permet de valider, charger, générer et documenter les variables d’environnement à partir d’un schéma `dotenv-never-lies`.

Il est conçu pour être utilisé :

- en local (par des humains)
- en CI (sans surprise)
- avant que l’application ne démarre (et pas après)

### Valider un fichier `.env` (CI-friendly)

Valide les variables sans les injecter dans `process.env`.

```bash
dnl check --schema env.dnl.ts
```

→ échoue si :

- une variable est manquante
- une valeur est invalide
- le schéma n’est pas respecté

### Charger les variables dans le process

Charge et valide les variables dans `process.env`.

```bash
dnl load --schema env.dnl.ts
```

Usage typique : scripts de démarrage, tooling local.

### Générer un fichier .env à partir du schéma

Génère un .env documenté à partir du schéma.

```bash
dnl generate --schema env.dnl.ts --out .env
```

Utile pour :

- initialiser un projet
- partager un template
- éviter les .env.example obsolètes

### Générer un schéma depuis un .env existant

Crée un fichier env.dnl.ts à partir d’un .env.

```bash
dnl reverse-env --source .env
```

Utile pour :

- migrer un projet existant
- documenter a posteriori une configuration legacy

### Afficher la documentation des variables

Affiche la liste des variables connues et leur description.

```bash
dnl print
```

Exemple de sortie :

```bash
FRONT_A: Mon site A
FRONT_B: Mon site B
FRONT_C: Mon site C
NODE_CORS_ORIGIN: URLs frontend autorisées à appeler cette API
JWT_SECRET: JWT Secret

```
