# `dnl export` command

The `export` command transforms variables **validated** by the DNL schema into formats that can be used directly by other tools: Docker, CI/CD systems, shell scripts, or Kubernetes manifests.

dnl export command provides sub commands. Each sub command, called _exporters_, correspond to a plugin that extends the available formats using a plugin system. Exporters are identified by their `name`s property. This name is used as the `<format>` in the CLI: `dnl export <format> <options>`.
**If multiple exporters share the same name, the last one loaded wins.**
The resolution of exporters follows a priority order (project > dependencies > built-in). See export plugins documentation for details [export-plugins.md](export-plugins.md).

## schema parameter

As with all DNL commands, the schema parameter can be used:

```
# default schema env.dnl.ts
dnl export <format>
dnl --schema my-dnl.ts export <format>
```

The principle is simple: the schema remains the source of truth. Variables are first loaded and validated, then transformed into a format suited to the target tool.

The `export` command never modifies the project configuration. It only transforms validated variables into a representation suited to another tool.

WARNING: if the environment variable source does not validate against the schema, `dnl export` will crash!

## format subcommand

The command always takes the following form:

```
dnl export <format> <options>
```

The format corresponds to an "exporter". Each exporter knows how to transform variables to a particular target.

The export feature includes a plugin system that allows extending the available formats.

The exact list of available formats therefore depends on the installed exporters. Built-in formats cover the most common cases (env, docker, GitHub, GitLab, Kubernetes, JSON, TypeScript). Additional exporters can be added as plugins.

To discover available formats and their options:

```
dnl export --help
```

Each format also has its own help:

```
dnl export <format> --help

# example:
dnl export env --help
```

This shows the options specific to that exporter.

To learn how to create your own exporters, see the documentation on [export plugins](export-plugins.md).

## source parameter

By default, values are read from `process.env`. It is common to use a `.env` file as the source:

```
# export json from process.env
dnl export json

# export json from .env file
dnl export json --source .env
```

In this example, variables from the `.env` file are validated against the schema and then exported in JSON format.

```
dnl export env --source .env
```

## --out and --force options

```
# Write output to .env.clean
dnl export env --out .env.clean

# Force overwriting .env.clean
dnl export env --out .env.clean --force
```

The generated file then contains only valid variables that conform to the schema.

## --hide-secret and --exclude-secret options

In the env.dnl.ts file, variables marked as secret are handled differently with these two options.

```
# Mask secret variables (replace with "********")
dnl export env --hide-secret

# Exclude secret variables (do not include them in the output)
dnl export env --exclude-secret
```

# Example of exporter included in DNL

Export can be used to prepare execution environments. For example for Docker:

```
dnl export docker-args --source .env
```

This command generates a series of `-e` arguments that can be used directly with `docker run`.

Example in GitLab CI:
