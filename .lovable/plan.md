# Game Progress & Achievements Persistence Plan

This plan implements local persistence for game progress, scores, and achievements using `localStorage`. This ensures that even if the page is refreshed or the game is restarted, the player's achievements and high scores are preserved.

## User Review Required

> [!IMPORTANT]
> The current persistence implementation uses `localStorage`. If you prefer a full backend API for cross-device synchronization in the future, we can migrate this to Lovable Cloud.

## Proposed Changes

### Game Logic & Persistence (`src/components/game/GameContainer.tsx`)

- Implement `SAVE_KEY` constants for local storage.
- Add logic to load saved state (high score, achievements) on component mount.
- Update the `addAchievement` function to persist new achievements immediately.
- Update game completion logic to save high scores.
- Add a "Progress" section to the HUD/UI to show total bananas collected or top score.

### Data Types (`src/lib/game/types.ts`)

- Add types for persistent game data if necessary.

## Technical Details

- **Storage**: `localStorage` (Synchronous, simple, no backend required).
- **State Management**: `useState` and `useEffect` for synchronization between storage and memory.
- **Achievements**: Stored as a unique array of strings.
- **High Score**: Stored as a single number.

### Example Schema
```json
{
  "monkey-long-achievements": ["Jungle Explorer", "Banana King"],
  "monkey-long-highscore": 5000
}
```
