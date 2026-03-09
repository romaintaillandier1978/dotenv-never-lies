# Process.env usage collector

The Process.env usage collector is an internal tool used by dotenv-never-lies to analyze source code.
Its purpose is to detect how environment variables are used in the application.

To do this, it traverses the AST of TypeScript or JavaScript files using ts-morph.
It does not perform a text search, but a syntactic analysis of the code. This allows process.env usages to be detected reliably.

Each detected usage is turned into an object describing the variable used, the access type, the position in the file, and any fallback values.
This information is then used by several dotenv-never-lies commands.

The infer command uses it to discover fallback values present in the code and to detect variables that are used but missing from the .env file.
The annotate command uses the same information to add comments in the code when the use of a variable is problematic.

The collector does not understand the application’s business logic.
It only observes syntactic usages of process.env.
Interpretation of this information is done by the tool’s various commands.

## Usage types detected by the collector

**global access**

Access to the global process.env object

```ts
const allEnv = process.env;
```

**static access**

Access to a specific property of the process.env object

```ts
const PORT = process.env.PORT;
const PORT = process.env["PORT"];
// with fallback
const PORT = process.env["PORT"] ?? "3000";
const PORT = process.env.PORT || "3000";
```

**dynamic access**

Access to a dynamic property of the process.env object

```ts
const PORT = process.env[key];
```

**destructured access**

Destructuring of the process.env object

```ts
const { PORT } = process.env;
const { PORT: MY_PORT = 3000 } = process.env;
```
