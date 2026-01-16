# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```





Event Stream Explorer

A frontend-heavy system for exploring real-time and historical user events, similar to analytics or monitoring dashboards.
The focus of this project is performance, correctness under stress, and clean architecture, not UI polish.

1. Problem Overview

The system consumes events from two sources:

Historical data (10k–50k events, unsorted)

Live stream (real-time events arriving asynchronously)

Users can:

View events in a virtualized table

Filter by time window, event type, and user ID

Toggle live updates ON/OFF

Scroll smoothly even with large datasets

Key constraints:

Max 5,000 events in memory

No UI freezing (16ms frame budget)

Correct handling of duplicates, bursts, and out-of-order events

2. High-Level Architecture

The app is split into clear layers:

Services → simulate data sources

Store → owns event memory and correctness

Hooks → handle filtering, pagination, and time windows

Components → rendering only (no heavy logic)

This separation keeps logic testable and rendering fast.

3. Data Structures Used (and Why)
3.1 Event Store (EventStore)
Map<string, Event>  // deduplication
Array<Event>        // sorted by timestamp (DESC)


Why this combination:

Map → O(1) duplicate detection

Array → efficient slicing for pagination & time windows

Events are always kept sorted by timestamp

Insertion uses binary insertion instead of re-sorting.

4. Memory Model (MANDATORY)
What is stored

At most 5,000 most recent events

Both historical and live events share the same store

What is evicted

Oldest events are evicted when size exceeds 5,000

Why it’s safe

UI queries (time window, pagination) only care about recent data

Prevents memory leaks under infinite live streaming

Matches real analytics dashboards behavior

5. Time-Window Filtering Optimization
Problem

Naively filtering events by time on every render is O(n) and slow.

Solution

Events are always sorted by timestamp (DESC).

We use binary search to find the cutoff index:

O(log n) → find cutoff
O(1) → slice array

Benefits

No full re-filtering on every render

Incremental updates work naturally as new events arrive

Stable under live streaming

6. Frame Budget Strategy (16ms)
What runs synchronously

Rendering visible rows only (virtualized)

Cheap array slicing

User input updates (typing)

What is deferred

Historical data ingestion (chunked)

Filtering (debounced + transitioned)

Live event bursts

How it’s done

processInChunks() with setTimeout

useTransition() for low-priority updates

Result

Scrolling stays smooth

Typing never lags

No long blocking tasks on main thread

7. Pagination Guarantees
Cursor Pagination Model

Cursor = event.id of last rendered item

Page = events up to cursor + page size

Cursor Invalidation Rules

If:

Event is evicted

Filter removes the cursor

Time window changes

Then:

Cursor resets safely to start

Merge Strategy with Live Data

Live events are inserted into the store

Cursor remains valid unless evicted

Pagination remains stable during live updates

8. Live Mode Concurrency Handling
Live Mode ON

Events are ingested immediately

UI updates incrementally

Live Mode OFF

Events are buffered silently

No UI updates triggered

When turned ON again

Buffered events are merged in batch

Deduplication and ordering preserved

9. Concurrency Decisions (MANDATORY)
Urgent updates

Typing in filters

Scrolling

Clicking buttons

Handled synchronously to avoid lag.

Non-urgent updates

Filtering results

Bulk event ingestion

Handled via:

useTransition

Chunked processing

Why: UX responsiveness is more important than instant data accuracy.

10. Performance Bottlenecks & Mitigations
Bottleneck	Mitigation
Large lists	Virtualized rendering
Sorting events	Binary insertion
Filtering	Binary search + transitions
Historical load	Chunked ingestion
Re-renders	Stable references + memoization
11. Known Tradeoffs (INTENTIONAL)

No backend persistence

No Web Workers (kept simpler)

No undo for filters (optional bonus skipped)

No fancy UI or styling

Cursor pagination is forward-only

These were skipped to focus on core system behavior.

12. What I’d Improve With More Time

Add Web Worker for historical ingestion

Persist cursor state across refresh

Add undo/redo for filters

Add metrics (FPS, render time)

Add automated performance tests

13. Key Takeaway

This project demonstrates how to build a real-time, high-performance frontend system that:

Handles large datasets

Respects memory limits

Remains responsive under stress

Uses clean, testable architecture

The emphasis is on correctness, performance, and clarity, not UI polish.
