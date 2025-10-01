# Card Game Codebase Analysis

## Overview
This repository contains a small Next.js application that implements a nine-card memory matching game with a Joker. The entire game logic lives inside the default page component (`app/page.tsx`), which is rendered as a client component. The UI is styled primarily with Tailwind CSS utilities defined in `app/globals.css` and `tailwind.config.ts`.

## Application Structure
- **Next.js App Router**: The app uses the App Router structure (`app/` directory). `app/layout.tsx` defines the root layout and metadata, while `app/page.tsx` hosts the interactive game.
- **Client Component**: `app/page.tsx` begins with `"use client";`, which enables hooks such as `useState` and `useEffect` for client-side interactivity.
- **Styling**: Global styles live in `app/globals.css`. Component-level styling uses Tailwind utility classes configured in `tailwind.config.ts`.

## Game Logic (`app/page.tsx`)
- **State**
  - `cards`: Array of card objects containing `id`, `symbol`, `isJoker`, `isFlipped`, and `isMatched` fields.
  - `firstIndex`, `secondIndex`: Track which cards are currently flipped for matching.
  - `lockBoard`: Prevents input while animations or evaluations are pending.
  - `message`: Feedback text shown to the player.
  - `gameOver`: Indicates a Joker reveal or completion of all pairs.
- **Deck Construction**
  - The `buildDeck` function generates eight normal cards (four pairs) plus a Joker, assigns sequential IDs, and shuffles them with `Array.sort(() => Math.random() - 0.5)`.
  - Resets all stateful flags and messages.
- **Lifecycle**
  - `useEffect` runs `buildDeck` once when the component mounts to initialize the game.
- **Interaction**
  - `handleClick` guards against invalid actions (board locked, game over, already matched/flipped cards).
  - Flipping the Joker ends the game immediately.
  - For normal cards, the handler manages the first and second selections, compares symbols, and updates match state.
  - `setTimeout` is used for delayed updates: quick confirmation for matches and longer delay before hiding mismatched cards.
  - When all eight non-Joker cards are matched, the message changes to a victory notification.
- **UI Rendering**
  - The board is a 3×3 grid of buttons whose labels reveal card symbols when flipped or matched.
  - Accessibility considerations include `aria-label` identifiers for cards and disabled states to prevent invalid interactions.
  - A reset button re-runs `buildDeck`, disabled while the board is locked.
  - Additional educational notes are provided in a `<details>` section for beginners.

## Potential Improvements
- Extract the card grid into a dedicated component to simplify `page.tsx`.
- Introduce animations (e.g., via CSS transitions) for flipping feedback.
- Replace the simple shuffle with a Fisher–Yates implementation to avoid bias.
- Add unit tests for deck construction and matching logic using a framework like Jest or Vitest.
- Localize strings or move them into a constants file for easier maintenance.

## Running the Project
```bash
npm install
npm run dev
```
Then visit `http://localhost:3000` to play the game.
