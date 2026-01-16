# dnl infer

La commande `dnl infer` permet de **générer automatiquement un schéma DNL** à partir d’un fichier `.env` existant.

Elle est conçue comme un **outil de bootstrap** : elle aide à démarrer rapidement sur un projet existant, mais **ne remplace jamais une revue humaine**.

## Objectif

Les projets hérités possèdent déjà un ou plusieurs fichiers `.env`, dont les variables ne sont ni typées, ni documentées. Ecrire un schéma DNL complet à la main serait coûteux au départ.

## Positionnement

### Ce que `infer` fait

Infer analyse les **valeurs brutes** et les **noms de variables**, applique une série de **règles heuristiques**.
Ensuite il propose un **schéma typé** (Zod / DNL) accompagné des **raisons** expliquant chaque inférence

Exemples de types inférés (par ordre de priorité) : json,list,port,version,url,email,string (fallback)

---

### Ce que `infer` ne fait PAS

C’est volontairement assumé.

`infer` :

- ❌ ne comprend pas le métier
- ❌ ne lit pas ton code applicatif
- ❌ ne déduit pas l’intention fonctionnelle
- ❌ ne fait pas d’inférence contextuelle entre variables
- ❌ ne modifie jamais silencieusement une valeur

Si une inférence est incorrecte, **c’est à l’utilisateur de la corriger**.

---

### Quand utiliser `infer`

Recommandé :

- sur un projet existant, lors de la migration vers DNL
- pour explorer un `.env` inconnu

---

### Quand NE PAS utiliser `infer`

Déconseillé :

- ne pas utiliser le schéma sans revue
- pour définir des règles métier
- pour documenter une API publique
- Une fois le schéma stabilisé, `infer` devient généralement inutile.

---

## Exemples d’utilisation du CLI

RTFM !

```bash
dnl --help
```

### Inférer un schéma à partir d’un fichier `.env`

```bash
dnl infer
```

Par défaut, `infer` analyse le fichier `.env` du répertoire courant et affiche le schéma généré dans la sortie standard.

---

### Spécifier un fichier `.env` explicitement

```bash
dnl infer --source .env.production
```

Utile lorsqu’un projet contient plusieurs fichiers d’environnement.

---

### Générer le schéma dans un fichier

```bash
dnl infer --source .env --output env.dnl.ts
```

Le schéma DNL est écrit dans le fichier cible au lieu d’être affiché dans le terminal.

---

### Mode verbeux

```bash
dnl infer --verbose
```

Affiche, pour chaque variable :

- les règles testées
- le score de confiance
- les justifications ayant conduit au schéma retenu

Ce mode est particulièrement utile pour comprendre ou contester une inférence.

extrait de sortie pour
`CONFS_JSON=  [{"firstname":"Romain", "lastname":"Taillandier"}]`

```bash
Infer CONFS_JSON :
    [jsonSchema]  confidence: 8 / threshold: 5
    JSON structure (+6)
    Env name contains key: JSON (+2)
    -> selected schema: jsonSchema("CONFS_JSON", z.array(z.unknown()))
```

---

### Générer et éraser le fichier existant

```bash
dnl infer --output my-env.dnl.ts --force
```

Permet d'écraser le fichier de sortie, à utiliser avec --output

---

## Principe général d’inférence

L’inférence repose sur un **pipeline de règles indépendantes**.

L’inférence est :

- déterministe
- reproductible
- sans état
- sans aléatoire

Chaque règle :

- décide si elle peut s’appliquer
- propose un schéma
- attribue un score de confiance, justifié

Le schéma final est sélectionné selon l’ordre de priorité des règles, à condition que le score de confiance dépasse un seuil minimal.

---

### Score de confiance et seuils

La notion de _score de confiance_ n’est **pas une probabilité mathématique**, c'est bien un score, calculé à partir d'heuristiques. Si le score dépasse un certain **seuil**, la règle est jugée fiable et appliquée et le schéma correspondant est utilisé.
le résultat de l'application de la règle contient, le score de confiance et ses justifications

Le score de confiance sert uniquement à :

- comparer plusieurs inférences possibles
- décider si une règle est suffisamment fiable
- afficher des justifications compréhensibles

Un score élevé ne signifie pas que l’inférence est “vraie”, mais qu’elle est **plausible selon les heuristiques connues**.

> score de confiance ≠ probabilité

---

### Heuristiques utilisées

Les heuristiques reposent principalement sur :

- le **nom de la variable** (`PORT`, `URL`, `ENABLE`, etc.)
- le **format de la valeur**
- des patterns simples (regex, plages numériques, formats connus)

Les patterns sont volontairement simples, non-ambigus, et durs.

Exemples :

- `PORT=3000` → port probable
- `ENABLE_CACHE=true` → boolean probable
- `API_URL=https://...` → URL probable

Ces règles sont **volontairement simples** et explicables.

> _Des heuristiques, pas de magie_

---

### Détection des secrets

`infer` tente d’identifier les variables **sensibles** :

- clés API
- tokens
- secrets
- mots de passe

Cette détection repose principalement sur le nom de la variable (`SECRET`, `TOKEN`, `KEY`, etc.)

⚠️ La détection n’est **jamais garantie à 100%**  
Elle sert à **alerter**, pas à sécuriser.

---

### Cas ambigus et warnings

Certaines variables sont intrinsèquement ambiguës :

- `VERSION`
- `PORT`
- `TIMEOUT`
- `ID`
- `LEVEL`

Dans ces cas :

- `infer` peut hésiter entre plusieurs types
- un warning est généré directement en commentaire dans le schéma
- le type retenu est celui jugé le plus plausible, ou choisi selon l'ordre des priorité

Ces warnings sont un **signal fort** indiquant qu’une revue manuelle est nécessaire.

---

# Workflow recommandé

1. Lancer `dnl infer`
2. Générer un schéma initial
3. Relire attentivement chaque variable
4. Corriger manuellement les types douteux
5. Ajouter descriptions et contraintes métier
6. Considérer le schéma comme la vérité finale
   Une fois le schéma stabilisé, `infer` devient généralement inutile.

---

# En résumé

- `infer` est un **outil d’aide**
- pas une autorité
- pas une IA magique
- pas une vérité métier

Il permet de **démarrer vite**, pas de **finir automatiquement**.
