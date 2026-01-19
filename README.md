# SentryLink Comply Phase A Mock UI

A small Next.js app demonstrating how SentryLink Comply Phase A feels for a Factory user.

This repo includes:
* AA: 3 screen mock UI using mocked JSON data and local state only
* BB: a minimal API thin slice (Option 1) plus the change request for selective disclosure

## Table of contents

* AA UI screens
* Tech stack
* Setup
* Assumptions
* Manual test checklist
* Screenshots
* BB thin slice API
* Change request implementation
* Documentation
* Production check

## AA UI screens

### Screen A Evidence Vault

Features:
* Table columns: Doc Name, Doc Type, Status, Expiry, Versions, Last Updated, Actions
* Filters: Doc Type, Status, Expiry (all, expired, expiring soon), Search
* Filters persist in the URL query string
* Bulk select plus Add to Pack button shows selected count

Route: `/evidence`

### Screen B Evidence Detail and Versions

Features:
* Evidence metadata plus status chip
* Version list (latest first)
* Upload New Version modal
  * Notes required
  * Expiry date required
  * File optional (mocked)

Route: `/evidence/[id]`

### Screen C Buyer Request To Do

Features:
* List of request items (docType, due date, status)
* Fulfill modal
  * Choose existing evidence from vault by docType
  * Or create new evidence (mock)
  * Marks item fulfilled and links to evidence

Route: `/requests`

## Tech stack

* Next.js App Router
* TypeScript
* Tailwind CSS
* Mock JSON data plus local state
* Vitest for unit tests

## Setup

Requirements:
* Node 18.18+ or Node 20+

Install:
```bash
npm install
```

Run dev server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

## Assumptions

* Expiring soon means within 30 days from today
* Uploading a new version sets evidence status to pending
* Evidence last updated becomes the upload date
* BB API uses an in memory store for the take home, data resets on server restart

## Manual test checklist

AA:
* Evidence Vault: filter by doc type, status, expiry, search, then refresh to verify URL persistence
* Bulk select a few rows and click Add to Pack
* Evidence detail: open an item, upload a new version, verify version count and status update
* Requests: fulfill using existing evidence, then fulfill by creating new evidence, verify new evidence appears in vault

BB:
* Buyer creates request (POST /api/requests)
* Factory fulfills request item (POST /api/requests/:requestId/items/:itemId/fulfill)
* Buyer checks status (GET /api/requests/:requestId)
* Buyer evidence access is blocked unless shared (GET /api/evidence/:evidenceId)

## Screenshots

Screenshots are in `docs/screenshots/`.

Optional: include a 3 to 5 minute screen recording showing:
* Evidence Vault filtering and Add to Pack
* Evidence Detail upload new version
* Requests fulfill existing and create new evidence

## BB thin slice API (Option 1 Request workflow)

This repo includes a minimal API thin slice built with Next.js Route Handlers and an in memory store.

### Authentication simulation

Send these headers with each request:
* `x-role`: `buyer` or `factory`
* `x-org-id`: `buyer_org_1` or `factory_org_1`

### 1 Create request (Buyer)

Method: POST  
Path: `/api/requests`

Headers:
* `x-role: buyer`
* `x-org-id: buyer_org_1`
* `Content-Type: application/json`

Body:
```json
{
  "factoryOrgId": "factory_org_1",
  "items": [
    { "docType": "Insurance", "dueDate": "2026-02-01" }
  ]
}
```

Response: 201
```json
{
  "request": {
    "id": "...",
    "items": [
      { "id": "..." }
    ]
  }
}
```

### 2 Fulfill request item (Factory)

Method: POST  
Path: `/api/requests/:requestId/items/:itemId/fulfill`

Headers:
* `x-role: factory`
* `x-org-id: factory_org_1`
* `Content-Type: application/json`

Body:
```json
{ "evidenceId": "ev_001", "versionId": "ev_001_v1" }
```

Response: 200
```json
{
  "sharedVersionId": "ev_001_v1",
  "item": { "fulfilledAt": "..." }
}
```

### 3 Get request status (Buyer or Factory)

Method: GET  
Path: `/api/requests/:requestId`

Headers (Buyer):
* `x-role: buyer`
* `x-org-id: buyer_org_1`

Headers (Factory):
* `x-role: factory`
* `x-org-id: factory_org_1`

Response: 200
```json
{
  "request": {
    "items": [
      { "fulfilledVersionId": "..." }
    ]
  }
}
```

### Postman note

Postman is a simple way to run the BB workflow on Windows without shell quoting issues.
Set the headers above, choose raw JSON body, and send the requests in order.

## Change request implementation (Selective disclosure)

Rule: Buyer can only access evidence versions explicitly shared via fulfill or included in a pack.

Implementation:
* An allowlist of evidenceVersionIds is maintained per buyer org
* Factory fulfill adds the fulfilled versionId to the buyer allowlist
* Buyer evidence access filters versions to only those in the allowlist

### Get evidence with buyer restricted versions

Method: GET  
Path: `/api/evidence/:evidenceId`

Access rules:
* Factory sees all versions
* Buyer sees only versions whose IDs are on their allowlist
* Buyer with no shared versions receives 403

## How to verify quickly (curl)

The commands below save the response to `response.json`, print HTTP status, then pretty print JSON with Python.

### A Buyer checks request status

Replace `<REQUEST_ID>` with a real request id.

```bash
curl -sS -X GET "http://localhost:3000/api/requests/<REQUEST_ID>" -H "x-role: buyer" -H "x-org-id: buyer_org_1" -o response.json -w "HTTP Status: %{http_code}\n"

echo
echo "========== Output Response =========="
echo

python -m json.tool response.json
```

Expected: 200 and the request includes items showing `fulfilledAt`, `fulfilledEvidenceId`, and `fulfilledVersionId` once fulfilled.

### B Evidence access before any share should be blocked

```bash
curl -sS -X GET "http://localhost:3000/api/evidence/ev_001" -H "x-role: buyer" -H "x-org-id: buyer_org_no_share" -o response.json -w "HTTP Status: %{http_code}\n"

echo
echo "========== Output Response =========="
echo

python -m json.tool response.json
```

Expected: 403.

### C Evidence access after share should show only shared versions

```bash
curl -sS -X GET "http://localhost:3000/api/evidence/ev_001" -H "x-role: buyer" -H "x-org-id: buyer_org_1" -o response.json -w "HTTP Status: %{http_code}\n"

echo
echo "========== Output Response =========="
echo

python -m json.tool response.json
```

Expected: 200 and `evidence.versions` contains only `ev_001_v1`.

## Documentation

* Mini design doc: `docs/mini-design-doc.md`
* Top 3 risks and mitigations: `docs/risks.md`
* Change request notes: `docs/change-request.md`

## Production check

```bash
npm test
npm run build
npm run start
```
