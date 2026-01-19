# Top 3 Risks and Mitigations

1) Incorrect access control (data leakage)
- Mitigation: centralize authorization checks, add tests for forbidden cases, audit logs, code review checklist.

2) Async export scalability and reliability
- Mitigation: idempotent jobs, retry with backoff, job status persisted, monitoring, and signed URLs with expiry.

3) Evidence expiry and version lifecycle complexity
- Mitigation: clear rules for which version is current, automated reminders, validations on upload, and consistent status computation.
