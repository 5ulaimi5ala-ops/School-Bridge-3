# Security Specification - SchoolBridge

## 1. Data Invariants

1.  **User Identity**: A user cannot modify another user's profile.
2.  **Parent-Child Link**: A parent can only view data related to their own classroom if their child is a student there (or directly view their child's profile if linked by `childId`).
3.  **Teacher Authority**: Only teachers can create classes and moderate help requests/messages in their own classes.
4.  **Student Participation**: Students can only join classes using a code and only interact with messages/help requests in classes they belong to.
5.  **AI Chat Privacy**: AI chat sessions are private to the student who created them.
6.  **Immutable IDs**: Document IDs and relational IDs (like `teacherId`, `studentId`) must remain immutable after creation.
7.  **Terminal States**: Once a help request is 'resolved', it cannot be changed back to 'pending' by a student.

## 2. The "Dirty Dozen" Payloads

1.  **Identity Theft**: A student attempts to update another student's `points` directly.
2.  **Shadow Update**: A user attempts to update a class document and inject a `isVerified: true` field not in the schema.
3.  **Path Poisoning**: A user attempts to create a document with a 1MB string as the ID.
4.  **Timestamp Fraud**: A user sends a `createdAt` value from the future.
5.  **Relational Orphan**: A student attempts to join a class that doesn't exist.
6.  **Privilege Escalation**: A student attempts to change their `role` to 'teacher'.
7.  **Unverified Access**: A user with an unverified email attempts to write data (if verification is enforced).
8.  **Bulk Leak**: A user attempts to list all users without being their parent or having a specific relational link.
9.  **Message Hijack**: A student attempts to delete a teacher's pinned announcement.
10. **Ghost Reply**: A user attempts to post a reply to a message in a class they are not a member of.
11. **Help Request Spam**: A user attempts to create thousands of help requests (size limit violation).
12. **AI Privacy Breach**: A teacher attempts to read a student's private AI chat history.

## 3. Test Runner (Draft)

A `firestore.rules.test.ts` will be created to verify these invariants.
