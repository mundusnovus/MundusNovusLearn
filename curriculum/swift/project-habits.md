---
id: project-habits
title: "Project: Habits for iPhone"
type: project
minutes: 240
---
# --description--

This is the project for the SwiftUI chapter. You will design and build **Habits**, a calm app for keeping small daily habits, from an empty Xcode project to an app you use every day on your own iPhone.

There is no code to copy. You have every tool you need: views and layout, `@State` and `@Observable`, lists, navigation, sheets, Liquid Glass, accessibility and animation. When you are stuck, look back at the lessons, read Apple's documentation (⌥-click any symbol in Xcode), or ask Xcode's coding assistant to *explain*, not to write it for you.

You will add saving with SwiftData in the next chapter, so for now keep your data in an `@Observable` model.

## User stories

1. I can add a habit with a name and an SF Symbol of my choice, in a sheet.
2. The main screen lists my habits, each showing its symbol, name and current streak.
3. I can mark a habit done for today with one tap; the streak goes up, with a satisfying animation. I cannot mark it done twice in one day.
4. I can tap a habit to see its details: its streak, its best streak, and the last 30 days as a grid of dots.
5. I can rename a habit, and delete it after confirming.
6. I can drag habits into the order I like.
7. The app has two tabs: **Today** (habits not yet done today) and **All habits**.
8. The app works in light and dark mode, at every text size, and with VoiceOver.
9. On iPad, All habits uses a split view.

## Hints

- Store a set of dates each habit was done. Work out "done today" and streaks from it with `Calendar.current.isDateInToday(_:)` and `Calendar.current.date(byAdding:value:to:)`. Write the streak logic as plain Swift functions first, and test them with Swift Testing.
- A `LazyVGrid` with seven columns makes a neat 30-day grid.

# --checklist--

- Every user story works on my iPhone.
- My streak calculation has Swift Testing tests, and they pass.
- I used Habits on my phone for at least three days, and fixed what annoyed me.
- I checked dark mode, the largest text size and VoiceOver.

# --questions--

## Where should "is this habit done today?" be worked out?
- [x] In the model, from the dates it was done, so it is always right and testable
- [ ] In a separate `Bool` stored alongside the dates
- [ ] In the view's body
Why: Derive it from the one source of truth; two copies drift apart.
