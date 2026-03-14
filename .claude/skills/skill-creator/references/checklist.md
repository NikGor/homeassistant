# Skill Readiness Checklist

## 🏷️ Frontmatter

- [ ] `name` is kebab-case, matches directory name, ≤64 characters
- [ ] `description` contains: what it does + when to apply + trigger phrases
- [ ] `description` is assertive: includes "Trigger on:" or "even if..."
- [ ] `disable-model-invocation: true` set for skills with side effects (`/deploy`, `/commit`)
- [ ] `user-invocable: false` set for background knowledge that doesn't make sense as a `/` command
- [ ] `allowed-tools` restricts tools where read-only or specific bash is needed
- [ ] `argument-hint` added if the skill accepts arguments
- [ ] `context: fork` + `agent:` set if the skill should run in an isolated sub-agent
- [ ] `model` specified only if a non-standard model is needed for this skill

## 📄 SKILL.md Body

- [ ] Instructions in imperative form
- [ ] WHY explained for every important rule
- [ ] Body under 500 lines (or hierarchy added + references/)
- [ ] Output format defined with a concrete template
- [ ] No excessive ALWAYS/NEVER without explanations

## 📦 Resources

- [ ] references/ loaded conditionally (specified when and why)
- [ ] scripts/ are executed, not just read
- [ ] Repeated code extracted into scripts

## ✅ Quality

- [ ] Skill generalizes the task, not overfitted to one example
- [ ] Edge cases and error handling described
- [ ] Tested on 2-3 realistic requests
