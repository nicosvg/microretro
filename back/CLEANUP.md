# Board Cleanup Feature

## Overview

Automatic cleanup job that deletes retrospective boards older than 1 week, with safeguards to preserve boards that have had recent activity.

**Architecture:** Uses database CASCADE constraints for clean separation of concerns. The `BoardRepository` only deletes boards; the database automatically handles cascading deletions to related entities.

## How It Works

### Automatic Cleanup (Cron Job)
- Runs daily at 2:00 AM UTC
- Checks all boards created more than 7 days ago
- For each old board:
  - Checks last activity date (cards, groups, reactions)
  - If last activity is also > 7 days ago: **deletes the board**
  - If there's recent activity: **keeps the board**

### What Gets Deleted
When a board is deleted, database CASCADE constraints automatically remove:
- All cards belonging to the board (via `cards.board_id → boards.id`)
- All groups in the board (via `groups.board_id → boards.id`)
- All member associations (via `members.board_id → boards.id`)
- All votes for those cards (via `votes.card_id → cards.id`)
- All reactions on those cards (via `reactions.card_id → cards.id`)

**Cascade chain:**
1. Delete board → automatically deletes cards, groups, members
2. Delete cards → automatically deletes votes, reactions

**Important**: Users are NOT deleted, only their association with the board.

### Manual Cleanup

You can trigger cleanup manually via API:

```bash
curl -X POST http://localhost:3000/api/admin/cleanup
```

Response:
```json
{
  "success": true,
  "deletedCount": 3,
  "message": "Successfully deleted 3 old board(s)"
}
```

## Logs

The cleanup process logs its activity:

```
[Cleanup] Starting board cleanup at 2026-04-02T02:00:00.000Z
Deleted inactive board: board-123
Keeping board board-456 due to recent activity (2026-03-30T10:15:00.000Z)
[Cleanup] Completed successfully. Deleted 1 board(s) in 245ms
```

## Configuration

To change the cleanup schedule, edit `back/src/index.ts`:

```typescript
// Current: Daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await cleanupService.runCleanup();
});

// Examples:
// Every hour: '0 * * * *'
// Every Sunday at midnight: '0 0 * * 0'
// Every 6 hours: '0 */6 * * *'
```

To change the retention period (currently 7 days), edit `back/src/core/usecases/cleanupOldBoards.ts`:

```typescript
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - 7); // Change 7 to desired days
```

## Testing

Run the cleanup tests:

```bash
bun test src/core/__tests__/usecases/cleanupOldBoards.test.ts
```

## Safety Features

1. **Activity tracking**: Boards with recent cards, groups, or reactions are preserved
2. **User preservation**: Users are never deleted, only board associations
3. **Transaction safety**: All deletions happen in a database transaction
4. **Error handling**: If cleanup fails, it logs the error but doesn't crash the server
5. **Logging**: All cleanup operations are logged for audit purposes
