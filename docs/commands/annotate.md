# dnl annotate

The `dnl annotate` command analyzes `process.env` usages in the code and adds explicit annotations to ease migration to DNL.

It does not run any business logic and never changes program behavior. It only adds comments intended for the developer.

Like `infer`, `annotate` relies on the Process.env usage collector ([see related documentation](../api/process-env-usage-collector.md)).
This shared engine analyzes the code AST and detects the various forms of access to `process.env`.
`annotate` then interprets these usages to produce readable annotations in the code.

## Purpose

`dnl annotate` makes all accesses to `process.env` visible and clearly indicates:

- whether the variable is known to the DNL schema
- whether it is unknown
- whether the access prevents reliable analysis (global or dynamic access)

The goal is to help gradually replace `process.env` with variables validated via DNL.

## Annotation types

Depending on the access form encountered, DNL adds one or more annotations:

- `@dnl-recommendation`: variable known in the schema but still used via `process.env`
- `@dnl-ignore`: variable absent from the schema, intentionally ignored
- `@dnl-dynamic-access`: dynamic access (`process.env[key]`) preventing per-variable analysis
- `@dnl-global-access`: global access (`process.env`) preventing any fine-grained analysis

A single statement may contain multiple accesses. In that case, only one comment block is added, but the report remains detailed for each access.

## Normal mode

```bash
dnl annotate
```

The command scans the code, adds the necessary annotations, and writes the modified files to disk.

This mode is intended for local development.

## Remove mode

```bash
dnl annotate --remove
```

Removes all previously added DNL annotations.

This mode is useful for cleaning up the code or preparing a new annotation pass.

## Check mode (CI / hooks)

```bash
dnl annotate --check
```

Does not modify the code. Analyzes accesses and returns an exit code suitable for CI.

- `0` if everything is compliant
- `5` if errors are detected

Related options:

- `--warn-as-error`: treat warnings as errors
- `--silent-warn`: hide warning output
- `--verbose`: show full detail of detected accesses

The `--check` mode is recommended in git hooks or continuous integration.

For example, when used in a Git hook, the `dnl annotate --check` command prevents a developer unfamiliar with DNL from introducing new `process.env` usage.

## Philosophy

`dnl annotate` does not try to guess the developer’s intent.

It reports what it sees:

- destructured process.env usages
- static process.env usages
- dynamic process.env usages
- global process.env usages

If the code is modified after annotation, it is up to the developer to run the command again.

Annotations are not retroactive.

## Report

Each execution also generates a machine‑readable report at `.dnl/annotate.report.json`.

This report summarizes the detected accesses, warnings, and potential errors.  
It is mainly intended for tooling, CI analysis, or debugging the annotation process.

## Recommended workflow

1. Run `dnl annotate`
2. Gradually replace `process.env` usages with DNL variables
3. Remove annotations once migration is complete `dnl annotate --remove`
4. loop until it's done (or not)
5. run `dnl annotate --check` to ensure no new `process.env` usages are introduced
6. optionally, add a githook to run `dnl annotate --check` on every commit

## Summary

- `annotate` helps migrate
- `--check` protects
- `--remove` cleans up

The command does not perform magic.
It makes explicit what was implicit.
