# SentryLink Comply Phase A Mock UI

A small Next.js UI demonstrating how Phase A feels for a Factory user.

## What is included

### Screen A: Evidence Vault
- Table: Doc Name, Doc Type, Status, Expiry, Versions, Last Updated, Actions
- Filters: Doc Type, Status, Expiry (all, expired, expiring soon), Search
- Filters persist in the URL query string
- Bulk select plus Add to Pack button shows selected count

Route: `/evidence`

### Screen B: Evidence Detail and Versions
- Evidence metadata plus status chip
- Version list (latest first)
- Upload New Version modal
  - notes required
  - expiry date required
  - file optional (mocked)

Route: `/evidence/[id]`

### Screen C: Buyer Request To Do
- List of requests (docType, due date, status)
- Fulfill modal
  - choose existing evidence from vault by docType
  - or create new evidence (mock)
  - marks item fulfilled and links to evidence

Route: `/requests`

## Tech
- Next.js App Router
- TypeScript
- Tailwind CSS
- Mock JSON data plus local state only
- Vitest for unit tests

## Setup

Requirements:
- Node 18.18+ or Node 20+

Install:
```bash
npm install
```

Run dev:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

## Assumptions

- Expiring soon means within 30 days from today.
- Uploading a new version sets evidence status to pending.
- Evidence last updated becomes the upload date.

## Manual test checklist

- Evidence Vault: filter by doc type, status, expiry, search. Refresh to verify URL persistence.
- Bulk select a few rows and click Add to Pack.
- Evidence detail: open an item, upload a new version, verify version count and status update.
- Requests: fulfill using existing evidence, then fulfill by creating new evidence, verify new evidence appears in vault.


### Screenshots are in (docs/screenshots/)


