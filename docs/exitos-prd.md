# ExitOS PRD

## Summary

ExitOS is a founder-facing agent for selling your company. It turns messy buyer diligence requests into an operating system for exit readiness: map the company systems, collect the right exports, validate the data room, flag risk, and package a buyer-ready manifest.

The first version is a public, interactive prototype at `/ExitOS`. It demonstrates the core workflow without requiring users to connect live accounts or upload confidential files.

## Problem

Small teams that get acquisition interest are suddenly asked to produce evidence from dozens of tools: Slack, Google Workspace, QuickBooks, Ramp, Mercury, Linear, GitHub, Notion, Zoom, Supabase, Firebase, Vercel, and more. The work is high-stakes, urgent, and fragmented across founder inboxes, admin consoles, local downloads, and ad hoc folders.

Founders do not need another generic data room. They need an agent that understands what buyers ask for, knows where the evidence lives, keeps the collection process moving, and produces a clean package that makes the company easier to evaluate.

## Target Users

- Primary: founders of small startups exploring an acquisition, acquihire, asset sale, or AI frontier-lab data deal.
- Secondary: chiefs of staff, finance operators, outsourced diligence support, and corp dev teams coordinating with founders.
- Buyer-side observer: the person who receives the final data room and wants confidence that the package is complete, legible, and low-risk.

## Positioning

ExitOS is the agent for selling your company.

It is not positioned as "enterprise M&A software." It is a lightweight operator that helps a founder get from "a buyer asked for everything" to "here is the complete, reviewed package."

## Jobs To Be Done

1. Translate a buyer or advisor request into a concrete export checklist.
2. Identify which company systems matter for the deal type.
3. Guide the founder through each export or access grant.
4. Validate that files are present, recent, and correctly named.
5. Flag sensitive material before it leaves the founder's control.
6. Produce a buyer-facing manifest, README, and status summary.

## V1 Scope

The shipped prototype includes:

- Company setup controls for sale path, buyer type, target timeline, and data sensitivity.
- A curated systems checklist based on the real services in the initial workflow.
- Dynamic readiness scoring and category coverage.
- Agent stages that simulate parsing, collection, validation, redaction, and packaging.
- A risk register that updates based on selected systems.
- A buyer manifest preview with downloadable JSON.
- Responsive design for desktop and mobile.

V1 does not include:

- Live OAuth connections.
- Real file uploads.
- Background workers.
- Account creation or authentication.
- Automated redaction.
- Actual data room storage.

## Core Workflow

1. Founder enters company context.
2. Founder selects the company systems in scope.
3. ExitOS calculates completeness, missing artifacts, and likely risks.
4. Founder runs an agent simulation that produces an export plan.
5. Founder downloads a manifest representing the buyer-ready package.

## Agent Model

ExitOS is designed as a coordinated set of agents with a founder approval layer.

- Planner agent: ingests a buyer request, advisor checklist, email, PDF, or shared data-room instructions and converts it into system-specific tasks with artifacts, owners, due dates, and date ranges.
- Systems-mapping agent: maps requested evidence to the actual company stack, such as Slack for communications, Ramp and Mercury for finance, GitHub and Linear for engineering, Supabase and Firebase for data, and Notion or Google Workspace for knowledge.
- Browser/operator agents: help execute admin-console export flows when APIs are missing or incomplete. These agents should request human approval before clicking through account access, export, invite, or sharing actions.
- Validation agent: inspects local export folders and files for completeness, freshness, naming consistency, expected file types, expected CSV columns, and missing date ranges.
- Risk-review agent: scans metadata and file previews for payroll data, customer PII, credentials, privileged communications, source-code secrets, financial account details, and other material that should be redacted or permissioned before sharing.
- Packaging agent: generates the buyer-facing manifest, README, unresolved-exceptions list, recommended folder structure, and final handoff summary.

The founder remains in control. Agents plan, gather, validate, and package; the founder approves sensitive exports, access grants, redactions, and final buyer sharing.

## Key Systems In Scope

The initial checklist is informed by the export work already done across:

- Finance: Ramp, Mercury, QuickBooks, Square, Deel.
- Communications: Slack, Zoom, Otter, Loom, Granola.
- Product and engineering: GitHub, Linear, Cursor, Vercel, Supabase, Firebase.
- Data and analytics: Heap, Metabase, dbt, Stitch, Google Analytics.
- Knowledge and operations: Notion, Google Workspace, Figma.
- Messaging and platform APIs: Twilio, Discord, Jira.

## Success Metrics

- A founder can understand the product promise in under 10 seconds.
- A founder can configure a realistic readiness plan in under 2 minutes.
- The app produces a useful manifest without external explanation.
- The workflow feels like a practical operator, not a marketing page.

## Future Versions

- Upload folders and automatically classify exports.
- Parse buyer request PDFs/emails into checklist items.
- Browser agent runs for admin consoles with human approval.
- OAuth-based connectors for supported SaaS tools.
- Local-first sensitive file review.
- Deal-room packaging to Drive, Dropbox, S3, or VDRs.
- Buyer-facing audit trail and completeness attestation.
- Redaction suggestions for secrets, personal data, payroll, and privileged communications.

## Open Questions

- Should ExitOS begin as founder self-serve, concierge-assisted, or both?
- Which buyer type is the sharpest wedge: AI labs buying data, strategic acquirers, acquihires, or small PE rollups?
- Should the first real integration be local folder validation, Chrome-guided exports, or Slack/Google/finance OAuth?
- What is the preferred trust model for sensitive data: local processing only, encrypted cloud vault, or bring-your-own-storage?
