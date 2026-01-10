injecter ces règles : pour expliquer à l'ia comment raisonner :

When a new env var is detected in code but missing in env.dnl.ts,
it MUST be added to the schema.

When an env var is removed from all usages,
it SHOULD be removed from the schema.

Never infer a default for secrets.
