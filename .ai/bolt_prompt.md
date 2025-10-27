# Prompt: Build PoC for Home Crew – Daily Board

## Goal

Create a minimal Proof of Concept that demonstrates the KEY FEATURE:

• Daily task board with two columns:
– “To Do”  
 – “Done”
• Ability to add a task to the current day by EITHER:

1. Selecting from a hard-coded list of 50 predefined household chores
2. Entering a custom task (title, optional time of day, optional emoji)
   • Drag-and-drop or button click to move a task from “To Do” to “Done”

## Scope Constraints

Exclude everything not essential to the above, e.g.:
– User authentication / roles  
– Data persistence beyond in-memory (a simple JS array is fine)  
– Navigation to past/future days  
– Accessibility hardening, i18n, mobile optimisations, rate-limits, logging, etc.

## Tech Stack (fixed)

Frontend: Astro 5 + React 19 islands + TypeScript 5 + Tailwind 4  
No backend—PoC may store state in the browser (e.g. React state).

## Deliverables

1. Single Astro page that renders the daily board with the two columns.
2. Hard-coded array with 50 predefined chores.
3. Modal or side panel to add either a predefined or custom chore.
4. Basic drag-and-drop OR two buttons (“Mark Done” / “Move Back”) to switch status.
5. Brief README explaining how to run the PoC locally (`npm install && npm run dev`).

## Process Requirement

BEFORE writing code:

1. Outline a step-by-step implementation plan (tasks, estimated effort, libraries).
2. Present the plan to the product owner for approval.
3. Start coding only after explicit approval.

Begin by returning the implementation plan.
