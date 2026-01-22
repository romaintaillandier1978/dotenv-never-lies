# dnl infer

The `dnl infer` command **automatically generates a DNL schema** from an existing `.env` file.

It is designed as a **bootstrap tool**: it helps you get started quickly on an existing project, but **never replaces a human review**.

## Goal

Legacy projects already have one or more `.env` files, whose variables are neither typed nor documented. Writing a full DNL schema by hand would be costly at the start.

## Positioning

### What `infer` does
### What `infer` does

**1) Fail on duplicate keys**
Before reading the environment variable source (using `dotenv` and `dotenv-expand`), `infer` checks for **duplicate keys** in the source file.  
If duplicates are found, the process fails early, since `dotenv` would otherwise silently override previous values.  
Related option: `--warn-on-duplicates`

**2) Discover presets**
`infer` relies on a set of predefined inference helpers called **presets**, which describe well-known and widely adopted environment variable patterns.

DNL first uses its **official preset registry**, covering common technologies and conventions.  
Then, during inference, it scans the user’s `package.json` to discover **third-party dependencies** that expose additional presets.

Presets do **not** inject variables or modify values.  
They only provide **additional inference rules** that help recognize known variable names and formats.

Related options:  
- `--presets <presets...>`  
- `--no-discover-presets`  

Examples of presets: `DATABASE_URL` from `prisma`, or `JWT_TOKEN` from `jsonwebtoken`.

**3) Heuristic inference**
Once the preset pool is built, `infer` analyzes **raw values** and **variable names**, and applies a series of **independent heuristic rules**.

Each rule may propose a typed schema (Zod / DNL), along with a confidence score and explicit justifications.  
The most reliable proposal is selected according to rule priority and confidence thresholds.

Examples of inferred types (by priority order): json, list, port, version, url, email, string (fallback)

---

### What `infer` does NOT do

This is deliberate.

`infer`:

- ❌ does not understand business domain
- ❌ does not read your application code
- ❌ does not deduce functional intent
- ❌ does not perform contextual inference across variables
- ❌ never silently modifies a value

If an inference is incorrect, **it is up to the user to correct it**.

**Inference rules are intentionally stricter than the schemas they generate.**

A schema describes what is allowed.
Inference only triggers when a value clearly matches a pattern, without ambiguity.

As a result, some values that would be accepted by a schema may not be detected by infer.
This is intentional: inference favors reliability over coverage.

---

### When to use `infer`

Recommended:

- on an existing project, when migrating to DNL
- to explore an unknown `.env`

---

### When NOT to use `infer`

Not recommended:

- do not use the schema without review
- to define business rules
- to document a public API
- once the schema is stable, `infer` usually becomes unnecessary

---

## CLI usage examples

RTFM!

```bash
dnl --help
```

### Infer a schema from a `.env` file

```bash
dnl infer
```

By default, `infer` analyzes your `package.json` and your `.env` file in the current directory and prints the generated schema to standard output.

---

### Explicitly specify a `.env` file

infer/

```bash
dnl infer --source .env.production
```

Useful when a project contains multiple environment files.

---

### Generate the schema into a file

```bash
dnl infer --source .env --output env.dnl.ts
```

The DNL schema is written to the target file instead of being printed in the terminal.

---

### Verbose mode

```bash
dnl infer --verbose
```

Displays, for each variable:

- the preset it have been discovered from

OR

- the tested rules
- the confidence score
- the justifications that led to the selected schema

This mode is particularly useful to understand or challenge an inference.

output excerpt for
```env
NODE_ENV=test
DATABASE_URL=postgres://rom:pwd@localhost:5432/db
CONFS_JSON=[{"firstname":"Romain", "lastname":"Taillandier"}]
```

```bash
  Infer NODE_ENV : 
    -> inferred from preset node
  Infer DATABASE_URL : 
    -> inferred from preset prisma
  Infer CONFS_JSON :
    [jsonSchema]  confidence: 8 / threshold: 5
    JSON structure (+6)
    Env name contains key: JSON (+2)
    -> selected schema: jsonSchema("CONFS_JSON", z.array(z.unknown()))
```

---

### Generate and overwrite the existing file

```bash
dnl infer --presets node prisma
```

Allows overwriting the output file, to be used with --output.

---

### Manually Specify presets  

```bash
dnl infer --output my-env.dnl.ts --force
```

---

Prevent infer process to scan your package.json, and use specified presets.

### without presets  

```bash
dnl infer --no-discover-presets
```

Prevent infer process to use any presets at all.

---

## General preset principle

Presets are **named collections of inference rules** focused on specific technologies or conventions.

A preset does not define variables by itself.  
It only provides **additional heuristics** that help `infer` recognize known environment variable names and value formats more reliably.

Presets can be:
- **official**, maintained and versioned by DNL
- **third-party**, exposed by user dependencies and discovered at runtime (upcoming)

**Preset rule validation**

If a preset rule matches a variable name, but the **raw value** from the `.env` file does not satisfy the rule’s Zod schema, the preset rule is **rejected**, and the next inference rules can still apply.

**Conflicts and determinism**

When multiple preset rules apply, inference always remains deterministic:

- If the proposed results are identical (same kind, same inferred type, same generated code), they are **merged** (and their origins can be aggregated).
- If the proposed results differ, the conflict is **not resolved** by presets, and inference continues with the next rules in the pipeline.



[Official preset list](official-preset-registry.md)

---

## General inference principle

Inference relies on a **pipeline of independent rules**.

Inference is:

- deterministic
- reproducible
- stateless
- without randomness

Each rule:

- decides whether it can apply
- proposes a schema
- assigns a justified confidence score

The final schema is selected according to the priority order of the rules, provided the confidence score exceeds a minimum threshold.

---

### Confidence score and thresholds

The notion of a _confidence score_ is **not a mathematical probability**; it is a score computed from heuristics. If the score exceeds a certain **threshold**, the rule is deemed reliable and applied, and the corresponding schema is used.
The result of applying the rule contains the confidence score and its justifications.

The confidence score is only used to:

- compare several possible inferences
- decide whether a rule is reliable enough
- display understandable justifications

A high score does not mean the inference is "true", but that it is **plausible according to known heuristics**.

> confidence score ≠ probability

---

### Heuristics used

Heuristics mainly rely on:

- the **variable name** (`PORT`, `URL`, `ENABLE`, etc.)
- the **value format**
- simple patterns (regex, numeric ranges, known formats)

Patterns are intentionally simple, unambiguous, and strict.

Examples:

- `PORT=3000` → probable port
- `ENABLE_CACHE=true` → probable boolean
- `API_URL=https://...` → probable URL

These rules are **intentionally simple** and explainable.

> _Heuristics, not magic_

---

### Secret detection

`infer` attempts to identify **sensitive** variables:

- API keys
- tokens
- secrets
- passwords

This detection mainly relies on the variable name (`SECRET`, `TOKEN`, `KEY`, etc.).

⚠️ Detection is **never guaranteed 100%**  
It is meant to **warn**, not to secure.

---

### Ambiguous cases and warnings

Some variables are inherently ambiguous:

- `VERSION`
- `PORT`
- `TIMEOUT`
- `ID`
- `LEVEL`

In these cases:

- `infer` may hesitate between several types
- a warning is generated directly as a comment in the schema
- the retained type is the one deemed most plausible, or chosen according to priority order

These warnings are a **strong signal** that manual review is needed.

---

# Recommended workflow

1. Run `dnl infer`
2. Generate an initial schema
3. Carefully review each variable
4. Manually correct questionable types
5. Add descriptions and business constraints
6. Consider the schema the final truth
   Once the schema is stable, `infer` usually becomes unnecessary.

---

# In summary

- `infer` is a **helper tool**
- not an authority
- not a magic AI
- not a business truth

It helps you **start fast**, not **finish automatically**.
