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

### infer

Lors de l'inférence dnl on cherche les intentions, pas la vérité.

Il ne faudra jamais essayer d'inférer des types path / file path / filename
pourquoi ?

- les regex pour identifier un chemin sont très difficiles.
  séparateurs de chemin / ou \
  changement de dossier . ou ..
  regex internes \* ou \*\*
  caractères différents selon les plateformes, espace : .
  C:\ extensions ...
  chemin relatifs, absolus, complets incomplets ...
- même si on trouve une super regex, on risque d'attraper ce qui aurait du être une string.
  donc beaucoup de faux positifs.
- enfin, les paths _sont_ des strings, et toujours utilisés comme tel.
  en faire des types différents pour les détecter (inférence), puis les remettre en string, ca n'a aucun sens

Il ne faudra jamais essayer d'inférer le type de CORS.

- déjà le typage de cors est relatif au paquet npm qui va l'utiliser
- exemple cors, utilise le typage suivant :
  boolean | string | RegExp | (boolean | string | RegExp)[] | undefined | "\*";
    - "true" qui n'existe peut être pas dans d'autres lib
    - tous les autres cas sont couvert par string ou string[],
    - tombe dans notre schéma / inférence listSchema of string ou z.String()

Les autres types qu'on ne veut pas inférer car inutile ou trop situationnels :

- xml / html pareil, on risque beaucoup de faux positifs.

### Export type (.d.ts)

Il ne faut pas essayer de mieux typer lors de l'export types.  
Il faut résister à la tentation de parser le fichier source env.dnl.ts, car on aurait des types ts OK, qui pourrait ne pas refléter la réalité runtime.
=> Catastrophe.
