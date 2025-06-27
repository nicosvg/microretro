# Emoji Selection Feature Specification

## Overview
Users can select one emoji from a predefined list on each card during the retrospective. The emojis are visible from the PRESENT step onwards, showing both the emoji and the count of users who selected it.

## Key Requirements

### Functional Requirements
- **Emoji Selection**: Users can select exactly 1 emoji per card from a predefined global list
- **Visibility**: Emoji selections are visible from PRESENT step until the end of the retrospective
- **Display**: Show emoji + count (e.g., "👍 3"), ordered by popularity (most popular first)
- **Editable**: Users can change their emoji selection

### Technical Requirements
- **UI**: Dropdown selector positioned at the bottom of each card
- **Real-time**: Updates via WebSocket events like existing voting system
- **Database**: New table structure for emoji selections (similar to votes table)
- **Architecture**: Follow existing domain-driven design patterns

### Predefined Emoji List
- 👍 (thumbs up)
- 👎 (thumbs down)
- ❤️ (heart)
- 🔥 (fire)
- 😂 (laughing)
- 🤔 (thinking)
- 🎉 (party)
- 😢 (cry)
