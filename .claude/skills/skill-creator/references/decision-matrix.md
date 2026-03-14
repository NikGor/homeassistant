# Decision Matrix: Do You Need a Skill?

## Quick Check

| Signal | ✅ Create a skill | ⚠️ Think twice | ❌ Not needed |
|--------|-------------------|---------------|--------------|
| Usage frequency | Regularly | Sometimes | One-off |
| Instruction volume | > 20 lines | 10–20 lines | < 10 lines |
| Needs extra files | Yes | Maybe | No |
| Rule stability | Months | Weeks | Days |
| Deterministic output needed | Yes | Preferably | No |

## When NOT to Create a Skill

- **One-off task** — if the task will happen once, solve it in dialogue. Skills are for *repeatable* scenarios.
- **Simple instruction** — if the instruction fits in 2-3 system prompt sentences, add it to the prompt.
- **Rapidly changing rules** — if logic changes weekly, the skill will constantly be outdated. Use config or prompt.
- **Similar skill exists** — check existing skills first. Better to extend a current skill than create a partial duplicate.

## Decision Flow

```
Is the task repeatable?
├── No → Solve in dialogue, no skill needed
└── Yes
    └── Are instructions > 10 lines?
        ├── No → Add to system prompt
        └── Yes
            └── Are rules stable (weeks+)?
                ├── No → Use config/prompt
                └── Yes
                    └── Does a similar skill exist?
                        ├── Yes → Extend existing skill
                        └── No → ✅ Create a new skill
```
