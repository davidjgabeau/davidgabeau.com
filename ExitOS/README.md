# ExitOS

ExitOS is a prototype for an agent that helps founders sell their company.

The product goal is to turn a messy buyer diligence request into a buyer-ready company package: export checklist, evidence map, readiness score, risk register, and manifest. It is designed for small teams preparing for a strategic acquisition, acquihire, asset sale, or AI-lab data deal.

Live prototype: https://davidgabeau.com/ExitOS

## What The Prototype Does

- Lets a founder configure company context: sale path, timeline, and data sensitivity.
- Maps common startup systems across finance, communications, knowledge, engineering, product, infrastructure, and data.
- Tracks whether each system is ready, blocked by an export, blocked by access, or needs risk review.
- Calculates a readiness score from the selected system states.
- Simulates an agent run that parses the diligence request, maps evidence owners, validates the package, runs risk review, and generates a buyer manifest.
- Generates a downloadable JSON manifest for the buyer data room.

## How ExitOS Uses Agents

The intended product is agentic, not just a checklist. The v1 page simulates the agent run in the browser, and the product spec describes how that simulation becomes real:

1. Planner agent: reads a buyer request, email, PDF, or advisor checklist and turns it into concrete tasks by system, artifact, owner, and date range.
2. Systems-mapping agent: matches requested artifacts to SaaS systems such as Slack, Google Workspace, Ramp, Mercury, QuickBooks, GitHub, Linear, Vercel, Supabase, Firebase, Notion, Zoom, and Deel.
3. Browser/operator agents: guide or execute admin-console export flows with human approval, especially for tools that lack clean APIs.
4. Validation agent: inspects exported folders and files for presence, freshness, naming, expected columns, date coverage, and missing artifacts.
5. Risk-review agent: flags payroll data, customer data, source code, credentials, private communications, privileged material, and other sensitive content before sharing.
6. Packaging agent: creates the final manifest, README, unresolved-exceptions list, and buyer-facing data room structure.

The human remains the approval layer. Agents propose, check, and package; the founder approves access grants, exports, redactions, and final buyer sharing.

## Current V1 Boundaries

This version is intentionally front-end only:

- No OAuth connections.
- No file upload or storage.
- No background workers.
- No real browser automation from the public page.
- No automatic redaction.

The purpose is to make the workflow legible and test the positioning: "the agent for selling your company."
