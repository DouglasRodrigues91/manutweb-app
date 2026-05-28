---
name: dispatch-parallel-agents
description: Dispatch multiple parallel sub-agents when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies. Speeds up debugging and feature development.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  category: workflow
---

# Dispatching Parallel Agents

## Overview

Delegates tasks to specialized agents with isolated context. Each agent gets precisely crafted instructions and context to stay focused. They never inherit your session's history — you construct exactly what they need.

**Core principle:** One agent per independent problem domain. Let them work concurrently.

## When to Use

**Use when:**
- 2+ independent tasks, failures, or features
- Each problem can be understood without context from others
- No shared state between investigations
- Multiple subsystems broken independently

**Don't use when:**
- Tasks are related (fix one might fix others)
- Need to understand full system state
- Agents would interfere with each other

## The Pattern

### 1. Identify Independent Domains

Group failures/features by what's separate.

### 2. Create Focused Agent Tasks

Each agent gets:
- **Specific scope:** One file, test, or subsystem
- **Clear goal:** Make this work
- **Constraints:** Don't change unrelated code
- **Expected output:** Summary of findings and changes

### 3. Dispatch in Parallel

Use the task tool to spawn one agent per domain concurrently.

### 4. Review and Integrate

When agents return:
- Read each summary
- Verify fixes don't conflict
- Run full test suite
- Integrate all changes

## Agent Prompt Structure

Good agent prompts:
1. **Focused** - One clear problem domain
2. **Self-contained** - All context needed
3. **Specific about output** - What should the agent return?

```
Fix the 3 failing tests in src/agent-tool-abort.test.ts:
1. "should abort tool with partial output capture"
2. "should handle mixed completed and aborted tools"
3. "should properly track pendingToolCount"

Return: Summary of what you found and what you fixed.
```

## Common Mistakes

- Too broad: "Fix all the tests" — agent gets lost
- No context: Agent doesn't know where to look
- No constraints: Agent might refactor everything
- Vague output: You don't know what changed

## Key Benefits

1. **Parallelization** - Multiple investigations simultaneously
2. **Focus** - Each agent has narrow scope
3. **Speed** - N problems solved in time of 1
