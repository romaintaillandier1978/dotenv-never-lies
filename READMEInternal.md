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

## TODO :

- vérifier les expand lors de l'export.

- supprimer sample
- ajouter une remarque personnelle sur vrai vécu, gros projet avec 150 variables d'environnement
