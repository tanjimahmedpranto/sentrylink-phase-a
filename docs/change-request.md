# Change Request Implementation

Rule added: Buyer can only access evidence versions that were explicitly shared via fulfill or included in a pack.

## What changed
1) Added an allowlist of version IDs per buyer org in `src/lib/serverStore.ts`:
- `allowedVersionIdsByBuyerOrg`

2) When a factory fulfills a request item, the fulfilled version ID is added to the buyer org allowlist:
- `serverStore.fulfillRequestItem(...)`

3) Added buyer restricted evidence endpoint:
- `GET /api/evidence/:evidenceId` in `src/app/api/evidence/[evidenceId]/route.ts`
- For buyers, evidence.versions is filtered to only allowed version IDs
- If none are allowed, returns 403
