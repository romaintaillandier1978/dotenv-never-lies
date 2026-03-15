# Road Map :

## CLI

### dnl add

ajouter un preset dans un env
exemple : dnl add prisma, express

## TU

### ajouter des TU plus haut pour l'inférence,

- qui testent de vraies entrées.
- tests de non regression sur l'inférence.

## LLM

- générer un document utilisable par l'ia dans le contexte de l'utilisateur
    - dnl export llm => Générer un artefact “LLM-friendly” pour l'outillage utilisateur qui ressemble à env.dnl.ts, pour le llm
    - normaliser / forcer les descriptions dans le schéma. sans desc => hallu
    - marquer les secret encore plus explictement {key:jwt,secret:true,exposed:false}

- rendre DNL facilement utilisable par un LLM : LLM integration Kit
    - créer des fichiers 'explication à destination des llm dans llm-kit
    - faut-il injecter ces fichier dans le projet de l'utilisateur ?
    -

- ne surtout pas faire : créer des prompts intégrés, dépendance a un llm

### preset registry tiers

Preset registry architecture
DNL repose sur deux registres distincts.

existant : Un registry officiel, généré au build-time (official-preset-registry.ts), référence l’ensemble des presets maintenus par DNL. Il est figé, versionné et importé statiquement pour garantir stabilité, typage et absence de surprises à l’exécution.

Lors de l’inférence, les deux registres seraient fusionnés dans un pool disponible contrôlé, sans qu’un preset tiers puisse écraser un preset officiel. Les presets réellement activés dépendent du mode (discover ou --presets).

Cette séparation garantit une architecture extensible, prévisible et sûre, tout en ouvrant DNL à un écosystème de presets externes.

## extensibilité :

- générators, avec un model, une interface
- génériser EnvVarDefinition avec une propriété générique que DNL n'utilisera jamais. => pas si simple aprce qu'on ne type pas la def metadata dans la déclaration env.dnl.ts
