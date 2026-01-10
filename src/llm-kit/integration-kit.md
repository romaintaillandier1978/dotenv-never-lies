# DNL – AI Integration Guide

## Goal

Ensure environment variables are validated, typed, and documented using DNL.

## When integrating into an existing project

1. Check if TypeScript is used.
2. Install dependency:
    - npm install dotenv-never-lies
3. Create env.dnl.ts at project root.
4. Define schema using zod.
5. Add build step if necessary.
6. Ensure env.dnl.ts is included in tsconfig.

//TODO : inviter le LLM à rechercher process.env.`${key}` et utiliser le contexte local pour deviner les schéma avancés de zod et les descriptions
// TODO : inviter le LLM à utiliser les commentaires du .env pour deviner l'usage des différentes variables d'environnement.
