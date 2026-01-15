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

## Concept de Infer, et ce qu'il ne faudra jamais faire :

Lors de l'inférence dns on cherche les intentions, pas la vérité.

Il ne faut pas essayer de mieux typer lors de l'export types.  
Il faut résister à la tentation de parser le fichier source env.dnl.ts, car on aurait des types ts OK, qui pourrait ne pas refléter la réalité runtime.
=> Catastrophe.
