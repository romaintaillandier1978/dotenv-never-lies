# Inference design

## Introduction

This document does not describe how to use `dnl infer`.
It explains the design choices behind the inference mechanism, its limits, its deliberate choices,
and its tradeoffs.

---

## Philosophy

**Inference is not intent**

Inference works on weak signals: variable names and raw values.
Human intent, business or functional, is never accessible.

This impossibility is not a technical shortcoming, it is a fundamental constraint of the problem.

**Heuristics over intelligence**

Inference deliberately relies on simple, readable, deterministic heuristics. A more "intelligent", contextual, or probabilistic system would have produced more impressive results, but also more opaque, less reproducible, and harder to challenge.

**Explainability over accuracy**

In dotenv-never-lies, an inference must always be explainable. An incorrect but explainable inference is preferable to a correct but opaque one.

The system is designed to:

- produce a result with readable reasons
- enable the user to understand, correct, or reject the decision

**Determinism**

Inference is designed to be strictly deterministic. With identical input, the output must be identical, regardless of environment, time, or user.

This constraint is essential for CI, Git diffs, and trust in the tool.

**Ambiguity is structural**

Some variables are ambiguous by nature.
No heuristic can resolve them correctly without external information.

Rather than masking this ambiguity, dotenv-never-lies chooses to make it visible, through:

- broader type choices
- visible warnings
- explicit, justified confidence scores

This caution is intentional.
Overly aggressive inference creates false confidence and pushes errors further into the project lifecycle.

The confidence score is not a _measurement_, it is an interface tool between the machine and the human. It is used to rank hypotheses, justify a decision, and signal fragile areas.

---

## Rule engine

**Why rule-based inference won**

The rule pipeline is not a default choice, but a direct response to the constraints above.

It enables:

- rule independence
- explicit ordering
- incremental evolution
- and removal without side effects

Inference relies on an intentionally simple and deterministic algorithm.

**Algorithm**

For each variable, the engine applies a sequence of rules ordered by priority.
Each rule examines the variable name and its raw value, then can either refuse to apply or propose a schema with a confidence score.

As soon as a rule produces a result whose score exceeds its minimum threshold,
inference stops and the schema is retained; following rules are not executed. (then we move on to the next variable)

There is no backtracking, no result combination, no voting between rules.
A single rule wins, the _first_ one that yields a confidence score above its threshold.

This behavior guarantees:

- predictable behavior
- fast execution
- and a decision that is always explainable

**Rule priority as a design tool**

Rule priority is not an implementation detail.
It is a central design tool.

Some forms are more structuring than others.
For example, a JSON value must be detected before a list, and a list before a string.

> Some priorities express "golden rules" of the system, documented and assumed.

Priorities allow these relations to be expressed without complex heuristics or hidden conditional logic.
They make conflicts explicit, readable, and easy to resolve.

Changing a priority is never trivial: it modifies the overall reading of the system
and must be considered a design choice, not a fine-tuning.

**Unit tests as design constraints**

Inference rules are covered by explicit unit tests.
These tests do not only detect regressions: they document the expected behavior of the engine.

Modifying a rule, its threshold, or its priority almost always results in updating the associated tests. This is intentional.

Tests constitute a form of contract: they freeze design tradeoffs and make the consequences of a change visible.

Any modification of a rule without adjusting the tests should be considered suspicious and requires careful review.

---

## The unexpected centrality of inference

Initially designed as a migration tool, inference gradually structured the core of the dotenv-never-lies schema model.

It imposed:

- clear primitives
- sharp boundaries
- explicit definitions of the types that are truly useful

This centrality is an emergent, unplanned effect.

---

## Conclusion

> Inference is neither intelligent, nor magic, nor complete.

It is intentionally limited, explainable, and conservative.

It is not meant to decide, but to help a human decide faster and more cleanly.
