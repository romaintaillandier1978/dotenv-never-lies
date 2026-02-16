# dnl annotate

La commande `dnl annotate` analyse les usages de `process.env` dans le code et ajoute des annotations explicites pour faciliter la migration vers DNL.

Elle n’exécute aucune logique métier et ne modifie jamais le comportement du programme. Elle ajoute uniquement des commentaires destinés au développeur.

## Objectif

`dnl annotate` rend visibles tous les accès à `process.env` et indique clairement :

- si la variable est connue du schéma DNL
- si elle est inconnue
- si l’accès empêche une analyse fiable (accès global ou dynamique)

L’objectif est d’aider à remplacer progressivement `process.env` par des variables validées via DNL.

## Types d’annotations

Selon la forme d’accès rencontrée, DNL ajoute une ou plusieurs annotations :

- `@dnl-recommendation` : variable connue dans le schéma, mais encore utilisée via `process.env`
- `@dnl-ignore` : variable absente du schéma, ignorée volontairement
- `@dnl-dynamic-access` : accès dynamique (`process.env[key]`) empêchant l’analyse par variable
- `@dnl-global-access` : accès global (`process.env`) empêchant toute analyse fine

Une même instruction peut contenir plusieurs accès. Dans ce cas, un seul bloc de commentaire est ajouté, mais le rapport reste détaillé pour chaque accès.

## Mode normal

```bash
dnl annotate
```

La commande parcourt le code, ajoute les annotations nécessaires et écrit les fichiers modifiés sur disque.

Ce mode est destiné au développement local.

## Mode suppression

```bash
dnl annotate --remove
```

Supprime toutes les annotations DNL précédemment ajoutées.

Ce mode est utile pour nettoyer le code ou préparer une nouvelle passe d’annotation.

## Mode vérification (CI / hooks)

```bash
dnl annotate --check
```

Ne modifie pas le code. Analyse les accès et retourne un code de sortie exploitable en CI.

- `0` si tout est conforme
- `5` si des erreurs sont détectées

Options associées :

- `--warn-as-error` : considère les warnings comme des erreurs
- `--silent-warn` : masque l’affichage des warnings
- `--verbose` : affiche le détail complet des accès détectés

Le mode `--check` est recommandé dans les hooks git ou en intégration continue.

Par exemple, utilisée dans un hook Git, la commande `dnl annotate --check` permet d’empêcher l’introduction d’un nouvel usage de `process.env` par un développeur qui ne connaît pas encore DNL.

## Philosophie

`dnl annotate` ne tente pas de deviner l’intention du développeur.

Il indique ce qu’il voit :

- accès statique
- accès dynamique
- accès global

Si le code est modifié après annotation, il appartient au développeur de relancer la commande.

Les annotations ne sont pas rétroactives.

## Workflow recommandé

1. Exécuter `dnl annotate`
2. Remplacer progressivement les usages de `process.env` par des variables DNL
3. Utiliser `dnl annotate --check` en CI
4. Supprimer les annotations une fois la migration terminée

## En résumé

- `annotate` aide à migrer
- `--check` protège
- `--remove` nettoie

La commande ne fait pas de magie.
Elle rend explicite ce qui était implicite.
