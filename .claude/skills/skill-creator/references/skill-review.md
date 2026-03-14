# Skill Review Guide

Use this guide when reviewing an **existing** skill. Apply it alongside `checklist.md` to catch issues that the basic checklist doesn't cover.

---

## Part 1: Complexity Level Audit

Determine whether the skill's structure matches its actual complexity. Mismatched complexity leads to either bloated SKILL.md bodies or unnecessary scaffolding.

| Level | Structure | SKILL.md size | When it's right |
|-------|-----------|--------------|-----------------|
| 🟢 Simple | SKILL.md only | ≤200 lines | Single responsibility, instructions are self-contained, no reference data needed |
| 🟡 Medium | + `references/` or `scripts/` | 200–400 lines | Has reference data worth separating, or deterministic operations suited to scripts |
| 🔴 Complex | All subdirs + hierarchy | 400–500 lines + `references/` | Multi-step orchestration with substantial reference material |

### Signs the skill is under-complex (needs upgrading)

- SKILL.md body exceeds 200 lines but has no `references/` — extract detail into reference files
- The body contains large static tables or lists that change independently of the instructions — move to `references/`
- There are repeated shell commands or deterministic operations — extract to `scripts/`
- The skill covers two distinct responsibilities — split into two skills

### Signs the skill is over-complex (needs simplification)

- Has `references/` or `scripts/` directories that are empty or unused
- `references/` files are never conditionally loaded from the body — they're either always loaded (inline them) or dead weight (remove them)
- The skill hierarchy is deeper than 2 levels — flatten it

**Action**: Adjust the structure to match the appropriate level. Extracting content to `references/` is the most common fix.

---

## Part 2: Staleness Resilience Audit

Code evolves. Skills that hardcode specific implementation details become misleading as the codebase changes — and they fail silently, because Claude trusts the skill even when it's wrong.

For each piece of specific information in the skill, ask: **"Will this still be true in 6 months?"**

### 🔴 Fragile patterns — fix these

**Hardcoded method signatures with full parameter lists**
```
# Fragile:
get_relevant_customer_data(customer_id, user_message, chat_history, product_no, assortment)

# Better:
get_relevant_customer_data() — main orchestration method; verify its current signature in the source file
```
Parameters are added and removed; the skill won't be updated to match.

**Hardcoded counts**
```
# Fragile:
"dispatches 17 named attribute handlers"
"applies pagination for 6 keys"

# Better:
"dispatches named attribute handlers (see source for current list)"
"applies pagination for a set of keys including: X, Y, Z"
```
Counts drift silently — the skill stays at 17 while the code grows to 22.

**Exhaustive enumerations of things that grow**
```
# Fragile:
"Handlers: customer_flags, financial_data, contacts, statistical_data, order_history,
 customer_assortments, customer_toplist, free_potential, potential, last_order_details,
 bonus, partner_customer, invoice_per_mail, orsy, customer_no, customer_credits,
 product_recommendations"

# Better:
"Key handlers include: financial_data, order_history, contacts (see _update_customer_data_by_attribute
 for the full list — new handlers are added here)"
```

**Named files/classes without a verification instruction**
```
# Fragile:
"Edit master_data_service.py"

# Better:
"Edit master_data_service.py (verify the file still exists with glob before editing)"
```

**Version-specific model names**
```
# Fragile:
model: claude-haiku-4-5-20251001

# Better:
model: claude-haiku-4-5
```

### 🟡 Acceptable patterns — monitor but don't necessarily fix

- **High-level architecture descriptions** — data flow overviews age slowly; OK to keep
- **Stable domain concepts** — "slot-filling", "attribute extraction", "write path" — these are durable
- **Key class and file names** — change infrequently; OK to use with a verification note for critical paths
- **Short, stable lists** — if a list has been stable for a long time and is unlikely to grow, keep it with "(including but not limited to)" if appropriate

### ✅ Resilient patterns — prefer these

- Point to the location, not the contents: "Find the handler in `_update_customer_data_by_attribute()` — it dispatches based on attribute name"
- Add verification steps: "Verify the method signature in the source file before using it"
- Qualify enumerations: "The main paginatable keys are X, Y, Z — check `api_controller.py` for the current full list"
- Instruct Claude to grep/view to confirm current state before acting on named locations

### How to apply

1. Read through the skill body
2. Flag every hardcoded method signature, count, full enumeration, and file path
3. For each: decide whether to generalize, qualify, or add a verification instruction
4. Pay special attention to `references/` files — they go stale faster because they're not in the main reading path and updates are easily forgotten
