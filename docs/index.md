# Documentation

This directory contains the project's maintained technical and operational documentation.
The documentation is grouped by audience and lifecycle so that contributors can find the
right level of detail quickly.

## Documentation Map

| Section                                             | Audience                                | Purpose                                                           | Status                    |
| --------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------- | ------------------------- |
| [Project](project/)                                 | Contributors, maintainers, and users    | Governance, security, release history, and contribution standards | Maintained                |
| [Architecture](architecture/)                       | Engineers and reviewers                 | Package boundaries, system design, and architectural decisions    | Maintained                |
| [Agents](agents/)                                   | Engineering and automation contributors | Development workflows, provider notes, and operational guidance   | Maintained                |
| [Plans](plans/)                                     | Maintainers and project leads           | Proposed changes, investigations, and implementation plans        | Historical or in progress |
| [Scheduler architecture](scheduler-architecture.md) | Engineers                               | Design and behavior of adaptive rate-limit scheduling             | Maintained                |

## Document Standards

Each maintained document should answer these questions near the beginning:

1. **Purpose**: What problem does this document address?
2. **Audience**: Who should use it?
3. **Scope**: What is included and excluded?
4. **Procedure or design**: What are the steps, responsibilities, or decisions?
5. **Validation**: How can a reader verify the documented behavior?
6. **References**: Where can related implementation or policy be found?

Use descriptive headings, short paragraphs, tables for structured comparisons, and fenced
code blocks for commands or source examples. Keep normative requirements explicit and use
relative links when linking to documents in this repository.

## Repository-Level Files

The root [README](../README.md) remains the public project entry point. Repository-local
instruction files such as `AGENTS.md` and `CLAUDE.md` remain beside the directories they
govern because development tooling discovers them by location.

## Contribution Workflow

When adding or changing documentation:

1. Place it in the section that matches its audience and lifecycle.
2. Add it to this index when it introduces a new category or workflow.
3. Keep links relative to the document that owns them.
4. Run the repository's Markdown formatting and link checks before submitting changes.
