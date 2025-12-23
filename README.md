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

## Installation

```bash
yarn add dotenv-never-lies
# ou
npm install dotenv-never-lies
```

## Définir un schéma

env.dnl.ts

```typescript
import { z } from "zod";
import { define } from "dotenv-never-lies";

export default define({
    NODE_ENV: {
        schema: z.enum(["test", "development", "staging", "production"]),
        description: "Environnement d’exécution",
    },

    NODE_PORT: {
        schema: z.coerce.number(),
        description: "Port de l’API",
    },

    JWT_SECRET: {
        schema: z.string(),
        description: "JWT Secret",
        secret: true,
    },

    SOME_API_BASE_URL: {
        schema: z.string().url(),
        description: "L’URL d’une super API",
    },

    ALL_TEST_RECIPIENT_BCC: {
        schema: z
            .string()
            .transform((v) =>
                v
                    .split(";")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((email) => {
                        const res = z.string().email().safeParse(email);
                        if (!res.success) {
                            throw new Error(`ALL_TEST_RECIPIENT_BCC contient un email invalide : "${email}"`);
                        }
                        return email;
                    })
            )
            .optional(),
        description: "Emails de test ajoutés en BCC en local/dev. Séparés par des points-virgules.",
    },
});
```

## Utilisation runtime

```typescript
import envDef from "./env.dnl";

export const ENV = envDef.load();
```

Résultat :

- ENV.NODE_ENV est un enum
- ENV.NODE_PORT est un number
- ENV.SOME_API_BASE_URL est une URL valide
- ENV.ALL_TEST_RECIPIENT_BCC est un string[] | undefined

Si une variable est absente ou invalide → le process s’arrête immédiatement. \
C’est volontaire.

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
• une variable est manquante
• une valeur est invalide
• le schéma n’est pas respecté

### Charger les variables dans le process

Charge et valide les variables dans process.env.

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
• initialiser un projet
• partager un template
• éviter les .env.example obsolètes

### Générer un schéma depuis un .env existant

Crée un fichier env.dnl.ts à partir d’un .env.

```bash
dnl reverse-env --source .env
```

Utile pour :
• migrer un projet existant
• documenter a posteriori une configuration legacy

### Afficher la documentation des variables

Affiche la liste des variables connues et leur description.

```bash
dnl print


NODE_ENV: Environnement d’exécution
NODE_PORT: Port de l’API
JWT_SECRET: Emails de test ajoutés en BCC en local/dev. Séparés par des points-virgules.
SOME_API_BASE_URL: L’URL d’une super API
ALL_TEST_RECIPIENT_BCC: Emails de test ajoutés en BCC en local/dev

```
