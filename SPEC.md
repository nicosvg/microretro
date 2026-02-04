# Feature Spec: Emoji Reactions for Cards

## Overview
Add emoji reaction capability to cards for expressing sentiment and acknowledgment during retrospectives. Reactions are purely social (separate from voting system) and anonymous (show counts only, not who reacted).

## Core Decisions

### Scope & Purpose
- **Relationship to Votes**: Completely separate systems. Reactions are social/sentiment, votes determine card priority/grouping
- **Attribution**: Anonymous counts only - show emoji + number, no user names/avatars
- **Constraints**: One reaction per user per card (any emoji)
- **Availability**: GROUP and PRESENT steps only
- **Step Behavior**: Show existing reactions in all steps, but disable adding/changing in WRITE and VOTE steps

### User Experience
- **UI Placement**: Always show existing reactions below card text, + button appears only on hover
- **Emoji Selection**: Curated set of 20 emojis (sentiment-focused)
- **Mobile Interaction**: Same as desktop - tap card to open context menu, includes reactions option
- **Accessibility**: Keyboard navigation with tab/arrow keys, enter to toggle reactions

### Technical Approach
- **Data Model**: Store userId arrays with reactions for validation, send to frontend but don't display
- **Real-time Sync**: Immediate WebSocket broadcast on every reaction change
- **Lifecycle**: Cascade delete when card deleted, preserve when cards grouped/moved
- **Performance**: Load all reactions upfront (simple, no lazy loading initially)
- **Race Conditions**: Cancel pending reaction API calls if board step changes
- **Abuse Prevention**: One per user per card is sufficient, no additional rate limiting

### Rollout
- Add reactions database table
- Deploy to all boards immediately
- No feature flags or gradual rollout

## Emoji Set (20 total)
👍 👎 ❤️ 😂 😄 😍 😢 😭 😡 😠 🤔 😮 💡 🎉 🔥 ⚡ ✨ 💯 🚀 ✅

## Data Model

### Database Schema
```typescript
// New table: reactions
{
  id: string (UUID, primary key)
  cardId: string (foreign key -> cards.id, CASCADE on delete)
  emoji: string (emoji character, max 4 bytes for Unicode)
  userIds: string[] (array of user IDs who reacted with this emoji)
  createdAt: timestamp
  updatedAt: timestamp
}

// Indexes:
// - (cardId, emoji) UNIQUE - one row per card per emoji type
// - cardId - for fast lookup of all reactions for a card
```

### Domain Type
```typescript
// domain/reaction.ts
export type ReactionId = string;
export type Emoji = string;

export interface Reaction {
  id: ReactionId;
  cardId: CardId;
  emoji: Emoji;
  userIds: UserId[];
  count: number; // derived: userIds.length
  hasReacted: boolean; // derived: current user in userIds
  createdAt: Date;
  updatedAt: Date;
}

// For frontend display (omit sensitive fields when sending to client)
export interface ReactionDTO {
  id: ReactionId;
  cardId: CardId;
  emoji: Emoji;
  count: number;
  hasReacted: boolean; // only for current user
}
```

### Repository Interface
```typescript
// core/ports/ReactionRepository.ts
export interface ReactionRepository {
  // Get all reactions for a card
  getReactionsByCard(cardId: CardId): Promise<Reaction[]>;

  // Get all reactions for multiple cards (batch fetch)
  getReactionsByCards(cardIds: CardId[]): Promise<Map<CardId, Reaction[]>>;

  // Add user's reaction (upsert: add user to userIds if not present)
  addReaction(cardId: CardId, emoji: Emoji, userId: UserId): Promise<Reaction>;

  // Remove user's reaction from a card (remove user from userIds)
  removeReaction(cardId: CardId, userId: UserId): Promise<void>;

  // Update user's reaction (remove from old emoji, add to new emoji)
  updateReaction(cardId: CardId, userId: UserId, newEmoji: Emoji): Promise<Reaction>;

  // Delete all reactions for a card (called on card deletion)
  deleteReactionsByCard(cardId: CardId): Promise<void>;
}
```

## API Endpoints

### GET /boards/:boardId/reactions
Get all reactions for all cards in a board.

**Response:**
```json
{
  "reactions": [
    {
      "id": "reaction-uuid",
      "cardId": "card-uuid",
      "emoji": "👍",
      "count": 5,
      "hasReacted": true
    }
  ]
}
```

### POST /boards/:boardId/cards/:cardId/reactions
Add or update current user's reaction to a card.

**Request:**
```json
{
  "emoji": "👍"
}
```

**Response:**
```json
{
  "reaction": {
    "id": "reaction-uuid",
    "cardId": "card-uuid",
    "emoji": "👍",
    "count": 6,
    "hasReacted": true
  }
}
```

**Validation:**
- User authenticated (JWT)
- Board in GROUP or PRESENT step
- Emoji is one of the 20 allowed emojis
- User hasn't already reacted with different emoji (if so, update instead)

**Events Published:**
- `REACTION_UPDATED` with full reaction data

### DELETE /boards/:boardId/cards/:cardId/reactions
Remove current user's reaction from a card.

**Response:**
```json
{
  "success": true
}
```

**Validation:**
- User authenticated
- User has a reaction on this card

**Events Published:**
- `REACTION_UPDATED` with updated counts (or `REACTION_DELETED` if last user removed)

## WebSocket Events

### REACTION_UPDATED
Published when any user adds, changes, or removes a reaction.

```typescript
{
  event: 'REACTION_UPDATED',
  payload: {
    cardId: 'card-uuid',
    reactions: [
      {
        id: 'reaction-uuid',
        cardId: 'card-uuid',
        emoji: '👍',
        count: 5,
        hasReacted: true // only accurate for the receiving user
      }
    ]
  }
}
```

## Frontend Components

### ReactionBar Component
Display reactions below card text.

**Props:**
- `cardId: CardId`
- `reactions: ReactionDTO[]`
- `readonly: boolean` (true in WRITE/VOTE steps)

**Behavior:**
- Shows all existing reactions as emoji buttons with counts
- Highlights user's current reaction (if any)
- Shows + button on card hover (if not readonly)
- Click emoji: toggle user's reaction (if not readonly, or switch if already reacted)
- Click +: open ReactionPicker

**HTML Structure:**
```html
<div class="reaction-bar">
  <button class="reaction-button ${hasReacted ? 'active' : ''}"
          disabled="${readonly}">
    <span class="emoji">👍</span>
    <span class="count">5</span>
  </button>
  <!-- more reactions -->
  <button class="add-reaction-button"
          aria-label="Add reaction"
          disabled="${readonly}">+</button>
</div>
```

### ReactionPicker Component
Emoji picker overlay showing the 20 curated emojis.

**Props:**
- `onSelect: (emoji: Emoji) => void`
- `onClose: () => void`

**Behavior:**
- Grid of 20 emoji buttons (4x5 or 5x4 layout)
- Keyboard navigation: arrow keys move focus, enter selects, escape closes
- Click outside to close
- Position near + button or context menu trigger

**HTML Structure:**
```html
<div class="reaction-picker" role="dialog" aria-label="Choose reaction">
  <div class="emoji-grid">
    <button class="emoji-button" aria-label="thumbs up">👍</button>
    <button class="emoji-button" aria-label="thumbs down">👎</button>
    <!-- 18 more -->
  </div>
</div>
```

### Updated Card Component
**Changes to Card.svelte:**
- Import ReactionBar component
- Fetch reactions for this card from store/context
- Show ReactionBar below card text
- Pass `readonly={step !== 'GROUP' && step !== 'PRESENT'}` to ReactionBar

## Implementation Plan

### Phase 1: Database & Domain
1. Create `reactions` table migration with Drizzle
2. Add `domain/reaction.ts` with types
3. Create `ReactionRepository` interface
4. Implement `DrizzleReactionRepo`
5. Create `InMemoryReactionRepo` for tests

### Phase 2: Backend API
1. Create use cases:
   - `addReaction.ts`
   - `removeReaction.ts`
   - `getReactionsByBoard.ts`
2. Add API endpoints to `elysiaRouter.ts`
3. Add WebSocket event publishing
4. Add validation for allowed emojis and step restrictions
5. Write use case tests

### Phase 3: Frontend State Management
1. Add reactions to board state
2. Create `reactionStore.ts` or add to existing store
3. Implement WebSocket event handlers for `REACTION_UPDATED`
4. Create service functions:
   - `addReaction(boardId, cardId, emoji)`
   - `removeReaction(boardId, cardId)`
   - `getReactions(boardId)`

### Phase 4: Frontend UI
1. Create `ReactionBar.svelte` component
2. Create `ReactionPicker.svelte` component
3. Update `Card.svelte` to include ReactionBar
4. Add hover state for + button
5. Implement keyboard navigation
6. Add CSS styling

### Phase 5: Integration & Testing
1. Test reaction flow end-to-end
2. Test step restrictions (disabled in WRITE/VOTE)
3. Test real-time updates with multiple users
4. Test keyboard accessibility
5. Test mobile interaction via context menu
6. Test performance with many reactions
7. Fix bugs and polish UX

### Phase 6: Deployment
1. Run database migration
2. Deploy backend changes
3. Deploy frontend changes
4. Monitor for errors
5. Gather user feedback

## Edge Cases & Constraints

### Step Change Race Condition
**Problem:** User clicks reaction while facilitator changes board step.
**Solution:** Cancel pending reaction API calls if board step changes. Show no error to user (silent fail).

### Multiple Tabs
**Problem:** User has board open in multiple tabs, reacts in one.
**Solution:** WebSocket events update all tabs. Both show updated state.

### Offline/Network Issues
**Problem:** User clicks reaction but network request fails.
**Solution:** Show optimistic UI update, revert on error. Show toast notification: "Failed to add reaction".

### Card Deletion
**Problem:** User reacts to card while another user deletes it.
**Solution:** Cascade delete handles this. API returns 404, UI ignores (card already removed from view).

### Performance with Many Reactions
**Problem:** 200 cards × 15 users × 20 emojis = potential 60k rows.
**Reality:** Not all users react to all cards. Likely ~5-10% reaction rate = 3-6k rows.
**Mitigation:** Load all upfront is fine for <10k reactions. If scaling issues emerge, add lazy loading later.

### Stale Data After Step Change
**Problem:** User sees reactions from GROUP step while in VOTE step.
**Solution:** This is intentional. Reactions are historical record. Show but disable interaction.

### Emoji Rendering
**Problem:** Different OS/browsers render emojis differently.
**Solution:** Use native emoji (not images). Accept minor visual differences. Test on Windows/Mac/iOS/Android.

### Duplicate Emoji Clicks
**Problem:** User rapidly clicks same emoji multiple times.
**Solution:** Client-side debounce (300ms). Backend is idempotent (check if user already in userIds array).

## Accessibility Requirements

### Keyboard Navigation
- Tab to focus reaction bar
- Arrow left/right to navigate between reaction buttons
- Enter to toggle reaction
- Tab to + button, enter to open picker
- In picker: arrow keys navigate emojis, enter selects, escape closes

### Screen Reader
- Announce reaction counts: "5 thumbs up reactions"
- Announce user's reaction: "You reacted with thumbs up"
- Announce when adding reaction: "Added heart reaction"
- Button aria-labels: "Add reaction", "Remove your reaction", "React with thumbs up"

### Focus Management
- Visible focus indicators on all reaction buttons
- Focus trap in reaction picker
- Return focus to + button when picker closes

### High Contrast
- Ensure emoji buttons have visible borders in high contrast mode
- Active/hover states work in high contrast

## Testing Strategy

### Unit Tests
- Use case: `addReaction` - adds user to userIds array
- Use case: `addReaction` - updates existing reaction if user already reacted
- Use case: `removeReaction` - removes user from userIds, deletes row if empty
- Repository: `getReactionsByCards` - batch fetch optimization
- Validation: rejects invalid emojis
- Validation: rejects adding reaction in WRITE step

### Integration Tests
- API: POST reaction returns updated count
- API: POST reaction publishes WebSocket event
- API: DELETE reaction updates count correctly
- API: Step restriction enforced (403 in WRITE/VOTE)

### E2E Tests
- User adds reaction, sees count increase
- Other users see real-time update
- User changes reaction, old one decrements, new one increments
- User removes reaction, count decrements
- Reaction UI disabled in WRITE step
- Keyboard navigation works

### Manual Testing
- Test on mobile (tap card menu)
- Test with screen reader (VoiceOver/NVDA)
- Test in high contrast mode
- Test with slow network (loading states)
- Test with 100+ reactions on a card (UI scaling)

## Metrics & Success Criteria

### Adoption Metrics
- % of boards with at least one reaction
- Average reactions per card
- Most used emojis (top 5)

### Performance Metrics
- API latency: <200ms for add/remove reaction
- WebSocket event latency: <100ms to broadcast
- Frontend render time: <50ms to update reaction counts

### Success Criteria
- 60%+ of active boards use reactions within first month
- <1% error rate on reaction API calls
- No performance degradation on boards with <500 reactions
- Zero accessibility violations in automated tests

## Future Enhancements (Out of Scope)
- Custom emoji sets per board
- Reaction analytics dashboard
- Reaction notifications
- Reaction history/timeline
- Filtering cards by reactions
- Reaction-based sorting
- Animated reaction effects
- Emoji skin tone selection
- Full emoji picker (3000+ emojis)
