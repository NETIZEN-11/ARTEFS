# Promptfoo to ARTEF Discovery and Gap Analysis

Date: 2026-09-09

## Scope and source of truth

This document is the discovery deliverable requested before implementation. The supplied
ARTEF transformation prompt is the requirements source for this pass. No separate ARTEF
PRD file was found in the repository, so requirements marked `partial` or `missing` mean
that the requested behavior was not found as a first-class, durable, and exposed contract;
related implementation may still exist in legacy eval/config metadata.

The repository is already branded `artef` and is a mature Promptfoo-derived TypeScript
modular monolith. This plan preserves existing behavior and uses adapters and explicit
contracts before considering any replacement.

## Architecture map

```text
CLI / Node SDK / React app
        |
        v
Express server and route modules (local API, Socket.IO, static app)
        |
        +--> eval orchestration and evaluator runtime
        |       +--> config/test synthesis and scheduler
        |       +--> provider registry and provider implementations
        |       +--> assertions, matchers, LLM grading, RAG matchers
        |       +--> red-team plugins, strategies, graders, risk scoring
        |       +--> tracing and result aggregation
        |
        +--> BullMQ/Redis evaluation, red-team, grading, maintenance workers
        |
        +--> Node adapters: Eval models, database, storage, cache, quality gates,
        |       regression, human review, release readiness, model audit
        |
        v
SQLite/libSQL + Drizzle tables and migrations
```

### Current ownership by area

| Area                  | Current implementation                                                                      | Architectural assessment                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public facade and SDK | `src/index.ts`, `src/contracts.ts`                                                          | Keep as compatibility surface; contracts are the first leaf-safe layer.                                                                                                    |
| CLI                   | `src/entrypoint.ts`, `src/main.ts`, `src/commands/`                                         | Broad and feature-rich; should continue calling application services rather than accumulating domain logic.                                                                |
| API/server            | `src/server/server.ts`, `src/server/routes/`                                                | Useful local API with Zod DTOs, but several handlers still reach directly into models/runtime services.                                                                    |
| Web UI                | `src/app/`                                                                                  | Existing eval, history, prompts, datasets, red-team, traces, and model-audit experiences; routes are not yet organized around the complete ARTEF information architecture. |
| Evaluation            | `src/evaluator.ts`, `src/evaluator/`, `src/node/`, `src/evaluate.ts`                        | Mature execution path; runtime port and in-memory store are migration seams.                                                                                               |
| Providers             | `src/providers/`, `src/providers/registry.ts`                                               | Extensive provider coverage and adapters; preserve and isolate behind a narrower provider port.                                                                            |
| Assertions and judges | `src/assertions/`, `src/matchers/`, `src/matchers/llmGrading.ts`, `src/matchers/rubric.ts`  | Strong existing capability; structured result contract needs consolidation and evidence normalization.                                                                     |
| Red team and safety   | `src/redteam/`, `src/redteam/plugins/`, `src/redteam/strategies/`, `src/redteam/graders.ts` | Broad attack/plugin coverage; durable session/finding/review APIs are incomplete.                                                                                          |
| RAG                   | `src/matchers/rag.ts`, RAG red-team plugins                                                 | Retrieval/generation signals exist, but failure provenance is not a first-class result model.                                                                              |
| Scheduler/workers     | `src/scheduler/`, `src/queue/`                                                              | Rate limiting, retrying, BullMQ workers, and queue stats exist; baseline queue type has no complete worker path.                                                           |
| Persistence           | `src/database/tables.ts`, `src/database/`, `drizzle/`                                       | SQLite/libSQL and Drizzle are established; schema is eval-centric rather than ARTEF entity-centric.                                                                        |
| Tracing               | `src/tracing/`, trace/span tables and routes                                                | OpenTelemetry-compatible instrumentation, OTLP ingestion, redaction, and local persistence exist.                                                                          |
| Model security        | `src/models/modelAudit.ts`, `src/commands/modelScan.ts`, `src/server/routes/modelAudit.ts`  | Separate model-audit workflow exists and should remain isolated from inference.                                                                                            |
| Quality/release       | `src/qualityGate/`, `src/regression/`, `src/humanReview/`, `src/releaseReadiness/`          | Core concepts exist, but mostly as Node services over eval records; first-class persistence/API and deterministic policy contracts need hardening.                         |
| Tests                 | `test/`, domain tests, server/database/tracing/red-team suites, app tests                   | Broad coverage exists; integration, smoke, browser, security, and full build checks must be run explicitly.                                                                |

## Promptfoo to ARTEF feature matrix

Status meanings: `present` means the capability is materially implemented; `partial`
means related code exists but the requested ARTEF contract, persistence, or workflow is
incomplete; `missing` means no sufficient implementation was located.

| ARTEF requirement             | Existing Promptfoo/artef feature                                                       |  Status | Action                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------- | ------: | ------------------------------------------------------------------------------------------------- |
| Evaluation engine             | Evaluator, test cases, prompts, matrix-like prompt/provider execution                  | Present | Keep and improve behind domain/application ports.                                                 |
| Provider abstraction          | Provider registry plus many provider implementations                                   | Present | Keep and wrap; reduce provider imports from domain code.                                          |
| Model execution               | Provider invocation, response parsing, usage, latency, cost fields                     | Present | Improve timeout/error/usage normalization.                                                        |
| Assertions and matchers       | Deterministic, JSON, semantic, tool, trajectory, moderation, custom assertions         | Present | Extend common structured assertion-result contract.                                               |
| AI judge                      | LLM grading, rubrics, remote grading, red-team graders                                 | Partial | Add replaceable `Judge` contract with confidence, evidence, version, and schema-invalid outcomes. |
| Red-team engine               | Plugins, strategies, attack generation, graders, risk scoring, remote generation       | Present | Keep and wrap in durable session/test/finding services.                                           |
| Safety evaluation             | Harmful content, refusal, jailbreak, compliance and safety-oriented plugins/categories | Partial | Add explicit safety aggregate and release-gate inputs.                                            |
| Security evaluation           | Injection, exfiltration, tool abuse, SSRF, RBAC/BOLA and related plugins               | Partial | Normalize security findings/severity/evidence and expose history.                                 |
| Model artifact security audit | ModelAudit CLI, API, persistence, UI, external scanner delegation                      | Present | Keep isolated; harden artifact provenance and authorization.                                      |
| RAG evaluation                | Relevance, recall, faithfulness and RAG red-team plugins                               | Partial | Add retrieval-vs-generation failure classification and stored component metrics.                  |
| Baseline management           | Regression detector can search a recent eval and compare by eval ID                    | Partial | Add approved baseline entity, immutable snapshot metadata, approval, and API/CLI.                 |
| Regression detection          | `src/regression/` compares pass rate, score, safety, security, latency, cost           | Present | Refactor to typed metric adapters and persist findings.                                           |
| Evidence and traceability     | Result response/grading metadata, trace/span linkage, media/blob storage               | Partial | Define evidence record and ensure every finding/result has trace/config/version references.       |
| Human review                  | `HumanReviewQueue`, low-confidence/critical/ambiguous routing                          | Partial | Replace eval JSON metadata storage with review tables and decision audit trail.                   |
| Release readiness             | Quality gate, regression detector, human-review checks, four readiness states          | Partial | Make policy deterministic, persisted, versioned, and available through API/CLI/CI.                |
| CI/CD quality gate            | CLI exit behavior, JSON/JUnit/reporting integrations, quality gate configuration       | Present | Extend exit-code contract for readiness states and stable machine-readable output.                |
| Performance and cost          | Latency and cost on eval results; token usage in provider responses                    | Partial | Normalize input/output tokens, retries, provider latency/errors, throughput, historical metrics.  |
| OpenTelemetry observability   | GenAI spans, OTLP receiver/exporter, redaction, local trace store and trace routes     | Present | Keep; enforce secret-safe attributes and evaluation/run/cell linkage.                             |
| Local-first database          | SQLite/libSQL, Drizzle tables, migrations, indexes                                     | Present | Keep adapter boundary; evolve schema without coupling core to Drizzle.                            |
| Database entities             | Evals/results, prompts, datasets, configs, blobs, model audits, traces/spans           | Partial | Add first-class runs/cells/findings/baselines/regressions/reviews/release decisions.              |
| Application/API layer         | Express routes with request schemas and route modules                                  | Partial | Introduce application services and repositories; keep handlers thin.                              |
| CLI client                    | Commander commands for eval, red-team, model scan, reports, integrations               | Present | Preserve commands; delegate new workflows to application services.                                |
| Web UI                        | Eval setup/results/history, red team, traces, model audit, prompts/datasets            | Partial | Add ARTEF navigation/views for baselines, regressions, review, release, safety, RAG, cost.        |
| Node/TypeScript SDK           | Package exports and evaluator/provider APIs                                            | Present | Add stable domain/application APIs without breaking current exports.                              |
| Long-running jobs             | BullMQ queues and workers for evaluation/red-team/grading/maintenance                  | Partial | Implement durable status/cancellation/recovery for every long-running ARTEF workflow.             |
| Retry, timeout, cancellation  | Scheduler, provider retries, queue attempts, signal handling                           | Partial | Make bounded policies explicit and consistently propagated.                                       |
| Authentication/authorization  | User/cloud routes and local auth behavior                                              | Partial | Define project/user ownership and route authorization before multi-user exposure.                 |
| Secret protection             | Sanitizers, redacted Azure tokens, trace attribute redaction                           | Partial | Audit logs, traces, API DTOs, uploads, provider configs, and CORS/auth boundaries.                |
| Reproducibility               | Persisted config/results/prompts/test cases and replay support                         | Partial | Version prompt/dataset/config/judge/provider metadata explicitly.                                 |
| Testing                       | Extensive unit/domain/server/database/red-team/tracing/app suites                      | Present | Add focused contract tests for new repository/application boundaries and CI gates.                |
| Documentation                 | README, docs site, architecture and scheduler docs                                     | Partial | Document actual APIs, domain model, migration compatibility, deployment and security posture.     |

## Feature classification

### KEEP

Evaluation execution, provider integrations, assertions/matchers, prompt and dataset
handling, red-team plugins/strategies, model-audit delegation, tracing, caching, reports,
CLI compatibility, existing API/UI workflows, and existing tests.

### IMPROVE

Structured errors, timeout/retry semantics, usage/cost normalization, security redaction,
API validation, worker lifecycle, quality thresholds, release decisions, and machine-readable
CI output.

### REFACTOR

Move business decisions out of route handlers and legacy runtime modules. Continue the
existing layer ratchet by extracting dependency-free contracts, repository interfaces, and
application services without rewriting provider or evaluator internals.

### EXTEND

AI judge contracts, safety/security aggregates, RAG provenance, baseline approval, regression
findings, evidence, human review, release readiness, historical metrics, and ARTEF UI/API views.

### WRAP

The mature evaluator, provider registry, assertion engine, red-team runner, model-audit
scanner, trace store, and existing persistence models should first be exposed through ports
and adapters.

### REPLACE only if necessary

No replacement is justified during discovery. The current eval-centric persistence can be
migrated incrementally with compatibility readers and backfills rather than deleted.

## Architecture risks and discriminating checks

1. **Legacy coupling:** `architecture:check` passes, but reports 13 back-edge categories and
   184 imports toward the target DAG. Check: prevent new edges, then ratchet one boundary at
   a time with architecture baseline changes reviewed alongside tests.
2. **Review durability:** human review items are embedded in eval metadata and use `any` casts.
   Check: a repository contract test must survive concurrent route/update operations and expose
   reviewer, decision, comment, prior result, final result, and timestamps.
3. **Baseline durability:** queue types include `baseline`, but the current job union and worker
   implementations cover evaluation, red-team, grading, and maintenance. Check: queue a baseline
   operation and verify status, retry, persistence, and recovery before claiming worker support.
4. **API/application boundary:** server routes often call models/services directly. Check: an API
   contract test should invoke an application service with a fake repository and no SQLite.
5. **Release determinism:** release readiness combines quality, regression, review, and critical
   finding signals, but the policy is coupled to `Eval`. Check: identical versioned inputs must
   produce identical output and stable exit behavior in a pure policy test.
6. **Security boundary:** local server configuration uses permissive CORS while auth is not a
   universal route boundary. Check: an authorization test for every project-scoped resource must
   fail closed before remote/multi-user deployment.

## Proposed migration plan

### Phase 0: Baseline and compatibility guardrails

- Freeze the current public CLI/config/provider/assertion behavior with compatibility tests.
- Record architecture check, typecheck, lint, unit, integration, smoke, browser, build, and
  security command results separately.
- Add a capability inventory and migration ADRs; do not rename or move broad source trees yet.

### Phase 1: Contracts and domain ports

- Create dependency-light typed contracts for evaluation runs/cells/results, findings,
  evidence, metrics, judge results, baselines, regressions, reviews, and release decisions.
- Define repository interfaces and provider/judge/trace ports in leaf-safe contracts.
- Add in-memory implementations for focused domain tests.

### Phase 2: Application services and durable persistence

- Add application services for evaluation start/status/results, baseline approval/comparison,
  review routing/decision, model audit, trace retrieval, and release readiness.
- Add Drizzle repositories and migrations for first-class ARTEF entities while retaining
  compatibility reads from `evals` and `eval_results`.
- Add indexes, ownership/project keys, immutable version snapshots, and migration tests.

### Phase 3: Evaluation, judge, safety, security, and RAG normalization

- Adapt the existing evaluator/provider/assertion/red-team implementations to the new ports.
- Normalize judge confidence/evidence/schema errors and route low-confidence outcomes.
- Persist safety/security categories, RAG retrieval/generation failure source, and evidence.
- Keep model artifact scanning as a separate audit workflow.

### Phase 4: Workers and operational reliability

- Complete durable job types for baseline, regression, release readiness, and review workflows.
- Add idempotency keys, cancellation, bounded retry policies, failure states, recovery tests,
  and durable progress/status. Remove process-local singleton state from long-running APIs.
- Preserve the in-process path for local development and tests.

### Phase 5: API, CLI, SDK, and UI

- Add thin API routes backed by application services and versioned Zod contracts.
- Add CLI/SDK commands for baseline approval, compare, review, release readiness, and report
  export while preserving existing commands and config formats.
- Extend the UI with dashboard, evaluation details, baseline/regression, human review, safety,
  RAG, performance/cost, traces, and release-readiness views using the API only.

### Phase 6: Production hardening and audit

- Enforce authentication/authorization and project scoping for non-local deployments.
- Audit secrets in logs/traces/responses/uploads, CORS, SSRF/path traversal, dependency risk,
  and model artifact handling.
- Run full test/build/security/performance suites, architecture ratchets, migration rehearsal,
  and a final PRD coverage review. Report remaining gaps honestly.

## Validation command set

The initial architecture check passed on 2026-09-09:

```text
npm run architecture:check
```

The complete validation sequence for implementation phases is:

```text
npm run tsc
npm run lint:src
npm run lint:tests
npm test
npm run test:integration
npm run test:smoke
npm run test:app
npm run test:app:browser
npm run build
npm run architecture:check
npm run openapi:check
npm audit --omit=dev
```

Some commands require local services, browser tooling, provider credentials, or a configured
model-audit executable. Their result must be reported separately rather than inferred from a
successful unit test or build.

## Discovery conclusion

ARTEF should be evolved as a modular monolith on the existing artef/Promptfoo foundation.
The repository already contains most execution primitives and several requested safety,
security, tracing, queue, regression, review, and release concepts. The highest-value gaps are
not a wholesale rewrite: they are stable domain contracts, repository/application boundaries,
durable ARTEF entities, deterministic release policy, evidence/version traceability, and
complete API/CLI/UI workflows around those concepts.
