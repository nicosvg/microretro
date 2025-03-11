# AI Summary Feature Implementation Plan

## Backend Changes

- [x] Add `summary` field to Board interface in domain/board.ts
- [x] Update DrizzleBoardRepo to handle new summary field
  - [x] Add column to boards table schema
- [ ] Modify goToNextState usecase to generate summary when reaching DONE step
  - [ ] Add aiChatPort as dependency
  - [ ] Implement summary generation logic:
    - Get top 3 voted cards
    - Group remaining cards by topic/similarity using AI
    - Generate markdown summary using AI
    - Save summary to board
- [ ] Update getFullBoard to include summary in response

## Frontend Changes

- [ ] Add summary display component in DONE step view
  - Show markdown-formatted summary
  - Add copy-to-clipboard button
- [ ] Update board interface to include summary field
- [ ] Add clipboard copy functionality
  - Use navigator.clipboard API
  - Show success toast

## AI Integration

- [ ] Create prompt template for summary generation
  - Include instructions for markdown format
  - Specify structure:
    - Top 3 voted items first
    - Grouped topics after
- [ ] Add error handling for AI failures
  - Fallback to simple text summary
  - Show error message to users

## Testing

- [ ] Add unit tests for summary generation logic
- [ ] Add integration tests for summary in board response
- [ ] Add e2e tests for summary display and copy functionality
- [ ] Test with various board states:
  - Few cards
  - Many cards
  - Tied votes
  - No votes

## Documentation

- [ ] Update API docs with new summary field
- [ ] Add feature documentation in user guide
- [ ] Add developer notes about AI usage
