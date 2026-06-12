# Security Specification for Zarco Studios

## Data Invariants
- **Project Integrity**: Every project MUST have a valid title, category, year, and cover image.
- **Access Control**: Publicly visible data (projects) can be read by anyone. Writes (create, update, delete) are restricted to authenticated administrators.
- **Identity Consistency**: All project creations and updates must include a timestamp synced with the server.

## The Dirty Dozen Payloads (Targeting Projects)

1. **The Poison ID**: Attempting to create a project with a 2MB string as ID.
   - *Expected*: `PERMISSION_DENIED` via `isValidId()` check.
2. **The Anonymous Write**: Attempting to create a project without an auth token.
   - *Expected*: `PERMISSION_DENIED` via `isSignedIn()` check.
3. **The Shadow Field**: Adding an `isAdmin: true` field to a project document.
   - *Expected*: `PERMISSION_DENIED` via strict schema validation (`hasOnly` or `size` constraints).
4. **The Future Timestamp**: Setting `createdAt` to a date in 2030.
   - *Expected*: `PERMISSION_DENIED` via `request.time` enforcement.
5. **The Type Confusion**: Sending `year: 2024` (number) instead of `"2024"` (string).
   - *Expected*: `PERMISSION_DENIED` via `is string` type check.
6. **The Giant Title**: Title length of 10,000 characters.
   - *Expected*: `PERMISSION_DENIED` via `.size() <= 200` check.
7. **The Orphan Update**: Updating a project to remove its `category` (required field).
   - *Expected*: `PERMISSION_DENIED` via `isValidProject()` validation.
8. **The Ghost Delete**: Deleting a project as an unauthenticated visitor.
   - *Expected*: `PERMISSION_DENIED` via `isSignedIn()` check.
9. **The Batch Overflow**: Attempting to create 500 projects in a single list query simulation.
   - *Expected*: `PERMISSION_DENIED` via rate limits and rule complexity.
10. **PII Injection**: Adding an `email` field to the public project document.
    - *Expected*: `PERMISSION_DENIED` via strict key list validation.
11. **The Spoof Creator**: Setting `ownerId` to another user's ID during creation.
    - *Expected*: Not applicable as projects are currently managed by a central admin, but would be blocked by `uid == request.auth.uid`.
12. **The Terminal State Break**: Changing a 'completed' project's metadata (if terminal states existed).
    - *Expected*: `PERMISSION_DENIED` via state locking logic.
