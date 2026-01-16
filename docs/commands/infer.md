# dnl infer

The `dnl infer` command **automatically generates a DNL schema** from an existing `.env` file.

It is designed as a **bootstrap tool**: it helps you get started quickly on an existing project, but **never replaces a human review**.

## Goal

Legacy projects already have one or more `.env` files, whose variables are neither typed nor documented. Writing a full DNL schema by hand would be costly at the start.

## Positioning

### What `infer` does

Infer analyzes **raw values** and **variable names**, and applies a series of **heuristic rules**.
It then proposes a **typed schema** (Zod / DNL) with **reasons** explaining each inference.

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

By default, `infer` analyzes the `.env` file in the current directory and prints the generated schema to standard output.

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

- the tested rules
- the confidence score
- the justifications that led to the selected schema

This mode is particularly useful to understand or challenge an inference.

output excerpt for
`CONFS_JSON=  [{"firstname":"Romain", "lastname":"Taillandier"}]`

```bash
Infer CONFS_JSON :
    [jsonSchema]  confidence: 8 / threshold: 5
    JSON structure (+6)
    Env name contains key: JSON (+2)
    -> selected schema: jsonSchema("CONFS_JSON", z.array(z.unknown()))
```

---

### Generate and overwrite the existing file

```bash
dnl infer --output my-env.dnl.ts --force
```

Allows overwriting the output file, to be used with --output.

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
