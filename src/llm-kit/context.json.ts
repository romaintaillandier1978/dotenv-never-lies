// TODO : l'injecter chez l'utilisateur dans .dnl/context.json
// Créer un schéma de ce type à destination d'un LLM
const context = {
    schemaFile: "env.dnl.ts",
    generatedTypes: "types/env.dnl.ts",
    runtimeImport: "env.dnl.js",
    conventions: {
        descriptionsRequired: true,
        secretsMustBeExplicit: true,
    },
};

// injecter directement dans cursor context :
export const contextInjection = `This project uses dotenv-never-lies.
The environment schema is defined in ${context.schemaFile}.
Types are generated in ${context.generatedTypes}.
Runtime import is ${context.runtimeImport}.
Conventions:
- Descriptions are required.
- Secrets must be explicit.
Secrets must not be exposed.
`;
