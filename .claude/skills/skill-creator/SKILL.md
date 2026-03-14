---
name: skill-creator
description: >
  Always use this skill when creating, editing, or improving Claude skills
  (SKILL.md files) in .claude/skills/ or .github/skills/. Covers: writing
  frontmatter (name, description, allowed-tools, context, model, hooks),
  structuring the SKILL.md body, adding scripts/references/assets, writing
  strong triggering descriptions, and testing skills. Use it even for
  routine skill edits — this skill contains the full style guide and
  checklist. Trigger on: "create skill", "new skill", "add skill",
  "SKILL.md", "skill frontmatter", "skill description", "skill not
  triggering", "improve skill description", "skill checklist".
disable-model-invocation: true
argument-hint: "[skill-name]"
---

# Creating and Editing Skills

A skill is a modular set of instructions and resources that extends Claude's capabilities for specific tasks. Skills live in `.claude/skills/` (or `.github/skills/`) and are activated automatically based on `description`.

## Getting Started

When this skill is invoked:

1. **If `$ARGUMENTS` is provided** — treat it as the target skill name (e.g., `/skill-creator my-skill` → you're creating or editing `my-skill`). Jump to [Step 1](#1-analyze-the-task) with that name in mind.

2. **If no arguments** — use `ask_user` to clarify intent before proceeding:
   - Ask: "Create a new skill, or review/improve an existing one?"
   - If reviewing: ask which skill (list skills found in `.claude/skills/` via glob)
   - If creating: ask what task or domain the skill should cover

3. **If reviewing an existing skill** — before reading the skill body in detail, do a quick architecture freshness check: grep/view the source files the skill references and verify that named classes, methods, model fields, and method parameters still exist and match what the skill describes. Skills go stale silently — a method renamed 3 months ago is still "correct" in the skill until someone notices. Flag any drift found before proceeding with the review.

Never assume the goal — wrong direction wastes both context and file edits.

## Main Process

### 1. Analyze the task

Before creating a skill, determine:
- **Repeatability** — the task must occur regularly; one-off tasks should be solved in dialogue
- **Volume** — if the instruction is under 10 lines, add it to the system prompt instead
- **Duplication** — check existing skills in `.claude/skills/`; don't create duplicates
- **Central instruction overlap** — read `CLAUDE.md` and `.github/copilot-instructions.md` (if they exist). If those files already cover the intended content, extend them instead of creating a skill. If they partially cover it, note which parts to skip in the skill body to avoid redundancy.

Read `references/decision-matrix.md` if you're unsure whether a skill is needed.

### 2. Create the structure

```
.claude/skills/{skill-name}/
├── SKILL.md           # Required
├── scripts/           # Optional: executable scripts
├── references/        # Optional: reference materials
└── assets/            # Optional: templates, output files
```

### 3. Write the frontmatter

Frontmatter is a YAML block at the top of `SKILL.md` between `---`. These are metadata that Claude always reads:

```yaml
---
name: my-skill              # kebab-case, ≤64 chars, matches directory name
description: >              # Main triggering mechanism — see section below
  [What it does]. Use when [context].
  Trigger on: "[phrase1]", "[phrase2]".
model: claude-sonnet-4-5-20250929    # Recommended: locks behavior to a specific model
---
```

**Required fields:** `name`, `description`

**Recommended fields:** `model`, `context` (for task-skills)

**Optional fields:**
| Field | When to use |
|-------|------------|
| `disable-model-invocation: true` | Skill with side effects (deploy, commit) — prevent auto-invocation |
| `user-invocable: false` | Background knowledge — Claude uses it, user doesn't invoke via `/` |
| `allowed-tools` | Restrict tools: `Read, Grep, Bash(git *)` |
| `context: fork` | Isolated sub-agent — for task-skills with file operations |
| `agent` | Sub-agent type with `context: fork`: `Explore`, `Plan`, `general-purpose` |
| `argument-hint` | Argument hint: `[issue-number]`, `[filename] [format]` |
| `hooks` | Skill lifecycle hooks |

### 4. Write a strong description

The description is the only thing Claude sees before loading the skill body. It must be **assertive and specific**.

**Structure:**
1. What the skill does (1 sentence)
2. When to apply (contexts, files, situations)
3. Trigger phrases (`Trigger on:`)
4. Implicit cases (`even if...`, `Use it even for...`)

**❌ Bad:**
```yaml
description: Tool for working with Excel files.
```

**✅ Good:**
```yaml
description: >
  Process, analyze and transform Excel/CSV files — add columns,
  compute metrics, filter rows. Use this skill whenever the user
  mentions xlsx, csv, spreadsheet, even if they don't explicitly
  ask for "Excel processing".
  Trigger on: "add a column", "filter rows", "merge sheets".
```

### 5. Write the SKILL.md body

The body contains instructions for Claude after activation. Optimal size — up to 500 lines.

**Style:**
- Imperative form: "Create a file...", "Check that..."
- Explain **why**, not just **what** — Claude performs better when it understands the reasoning
- Avoid `ALWAYS/NEVER` without explanation — instead explain consequences

**Body structure:**
```markdown
# Skill Title

## Main Process
1. Step one — what and why
2. Step two — what and why

## Output Format
[Concrete result template]

## Rules
[Constraints with explanation of why]

## Additional Materials
[Links to references/ and scripts/ with loading conditions]
```

### 6. Add resources (if needed)

- **`scripts/`** — executable scripts for deterministic tasks. Claude runs them, doesn't read the code
- **`references/`** — reference docs loaded on demand. Specify in SKILL.md body **when** to read them
- **`assets/`** — templates and files for output

### 7. Validate against checklist

Read `references/checklist.md` and verify the skill meets all criteria.

Check for **conflicts with central instructions** — read `CLAUDE.md` and `.github/copilot-instructions.md` and verify:
- The skill doesn't duplicate rules already stated there (redundancy causes drift when one is updated but not the other)
- The skill doesn't contradict them (a skill overrides the system prompt, so contradictions produce unpredictable behavior)
- If overlap exists: either remove the duplicate content from the skill, or add a note explaining why the skill intentionally overrides the central rule

When **reviewing an existing skill** (not creating from scratch), also read `references/skill-review.md` — it covers two additional dimensions the checklist doesn't:
- **Complexity level audit** — is the skill's structure (simple/medium/complex) appropriate, or should it be restructured?
- **Staleness resilience audit** — does the skill hardcode things that will drift as the codebase evolves (method signatures, counts, exhaustive lists)?

## Substitutions

Dynamic variables available in SKILL.md body:
- `$ARGUMENTS` / `$0`, `$1` — arguments passed on invocation
- `${CLAUDE_SESSION_ID}` — current session ID
- `${CLAUDE_SKILL_DIR}` — skill directory path

## Complexity Levels

| Level | Contents | SKILL.md size |
|-------|----------|--------------|
| 🟢 Simple | SKILL.md only | ≤200 lines |
| 🟡 Medium | + references/ or scripts/ | 200–400 lines |
| 🔴 Complex | + all subdirs + hierarchy | 400–500 lines + references/ |

## Rules

- **Name = directory** — `name` in frontmatter must match the skill directory name, otherwise `/` invocation will be confusing
- **Don't rename `name`** — renaming breaks references from other skills and user habits
- **One skill — one responsibility** — if a skill does two unrelated things, split it
- **Max 2 levels of hierarchy** — don't create deep dependency graphs between skills
- **references/ load conditionally** — always specify in SKILL.md body when and why to read each reference file

## Troubleshooting

### Skill isn't triggering automatically
- **Check the description** — Claude matches triggers literally. If the user said "create a workflow" and the description only says "create skill", it won't match.
- **Add more trigger phrases** — list the exact words users actually say; over-specify rather than under-specify.
- **Check `disable-model-invocation`** — if set to `true`, the skill only runs when the user explicitly invokes it via `/`. Remove it if you want auto-triggering.

### Skill triggers but produces wrong output
- **Check for conflicting instructions** — scan the body for ALWAYS/NEVER without explanations; they override Claude's judgment silently.
- **Verify the `model` field** — if pinned to a specific model version (e.g., `claude-haiku-4-5-20251001`), update to a non-dated alias.
- **Check references are loading** — if key content is in `references/`, verify the body specifies when/why to load it; orphaned references are silently skipped.

### Skill too long / context overflow
- Move large static tables and lists to `references/` and load them conditionally.
- Split a skill doing two unrelated things into two separate skills.

## Additional Materials

- Read `references/checklist.md` before finalizing — contains the full readiness checklist
- Read `references/decision-matrix.md` if you're unsure whether a skill is needed
- Read `references/skill-review.md` when reviewing an existing skill — covers complexity level audit and staleness resilience
- In any ambiguous situation (frontmatter field behaviour, triggering mechanics, context/agent options, hooks) — fetch the official documentation at `https://code.claude.com/docs/en/skills` and treat it as the authoritative source. Internal instructions in this skill are guidelines; the official docs take precedence when they conflict.
