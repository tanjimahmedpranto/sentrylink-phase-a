# Phase A Thin Slice Mini Design Doc

## Stack choice
Frontend: Next.js (App Router) + TypeScript + Tailwind for fast UI iteration and strong DX.
Backend: Next.js Route Handlers for a lightweight API without introducing a second service for Phase A.
DB: Postgres in production (Prisma or Drizzle ORM). For this take-home, use in-memory storage to keep scope tight.
Storage: S3-compatible object storage for evidence files (AWS S3 or GCS). Metadata in Postgres.

Why: Single repo, shared types, easy deploy, explicit API contracts, and a clear growth path to split services later.

## Data model (entities and relationships)
- Organization
- User (belongs to Organization, role: buyer or factory)
- Evidence (belongs to factory Organization)
- EvidenceVersion (belongs to Evidence, stored file pointer, expiry, notes, uploader)
- BuyerRequest (belongs to buyer Organization, targets factory Organization, has many BuyerRequestItems)
- BuyerRequestItem (belongs to BuyerRequest, docType, dueDate, status)
- Fulfillment (links BuyerRequestItem to EvidenceVersion or to Evidence with a specific version)
- Pack (belongs to buyer Organization, includes many EvidenceVersions via PackItem)
- PackItem (packId + evidenceVersionId)
- ShareLink (token, expiry, revokedAt, scope)
- AccessLog (shareLinkId, actor, timestamp, ip, action)

Relationships:
- Evidence 1..n EvidenceVersion
- BuyerRequest 1..n BuyerRequestItem
- BuyerRequestItem 0..1 Fulfillment
- Pack 1..n PackItem, PackItem n..1 EvidenceVersion

## Selective disclosure rules (Phase A)
Goal: Buyer sees only what they have been explicitly granted.
Rules:
- Buyer can view a request item and its status if they created it.
- Buyer can view an evidence version only if:
  - it was used to fulfill a request item for that buyer, OR
  - it was included in a pack owned by that buyer, OR
  - it is shared via a valid share link granting that version.
- Factory can view all evidence and versions for their org.

## Export pack approach (async job)
- POST /api/packs creates pack with status pending.
- Enqueue background job (BullMQ or cloud queue).
- Worker collects allowed EvidenceVersions, generates a zip, uploads to object storage.
- Update pack status to ready with download URL + expiry.
- GET /api/packs/:id returns status and downloadUrl when ready.

## Testing plan (minimum)
- Unit: filtering, versioning, access control predicates (buyer access rules).
- API integration: request create, fulfill, buyer status read, forbidden access to unshared versions.
- UI smoke: basic navigation and critical flows (playwright optional).
- CI: run typecheck + unit tests on push.

## 8-week delivery plan (4 milestones)
Milestone 1 (Weeks 1-2): Core data model, auth/roles, evidence upload metadata, request creation.
Milestone 2 (Weeks 3-4): Fulfillment flow, selective disclosure enforcement, audit logging baseline.
Milestone 3 (Weeks 5-6): Pack export async job, download links, retention and expiry handling.
Milestone 4 (Weeks 7-8): Hardening: permissions review, UI polish, monitoring, performance, docs and rollout.
