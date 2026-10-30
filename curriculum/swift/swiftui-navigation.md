---
id: nav-lists
title: Lists and ForEach
type: xcode
minutes: 18
---
# --description--

`List` shows rows in the style people expect on each platform: scrolling, separators, swipe actions and selection included. `ForEach` makes one row per item:

```swift
struct Habit: Identifiable {
    let id = UUID()
    var name: String
    var streak: Int
}

struct HabitList: View {
    @State private var habits = [
        Habit(name: "Read", streak: 4),
        Habit(name: "Walk", streak: 12),
    ]

    var body: some View {
        List {
            ForEach(habits) { habit in
                HStack {
                    Text(habit.name)
                    Spacer()
                    Text("\(habit.streak) days")
                        .foregroundStyle(.secondary)
                }
            }
            .onDelete { offsets in
                habits.remove(atOffsets: offsets)
            }
        }
    }
}
```

SwiftUI needs to tell rows apart, so that it can animate insertions and deletions correctly. Your items do that by conforming to **`Identifiable`**: they have an `id` that is unique and stable. `UUID()` makes a random unique identifier.

`.onDelete` adds swipe-to-delete. Lists also take sections and custom swipe actions:

```swift
List {
    Section("Today") {
        ForEach(habits) { habit in
            Text(habit.name)
                .swipeActions {
                    Button("Done", systemImage: "checkmark") { complete(habit) }
                        .tint(.green)
                }
        }
    }
}
```

## New in iOS 27: swipe actions and reordering anywhere

Swipe actions used to work only in `List`. In iOS 27 and macOS 27 they work in any scrolling container: add `.swipeActionsContainer()` to the `ScrollView`. Drag-to-reorder is no longer limited to `List` either: mark a `ForEach` `.reorderable()`, and handle moves on its container with `.reorderContainer(for:)`:

```swift
ScrollView {
    LazyVStack {
        ForEach(habits) { habit in
            HabitCard(habit: habit)
        }
        .reorderable()
    }
}
.reorderContainer(for: Habit.self) { difference in
    habits.apply(difference)
}
```

The `difference` lists the moved items' ids (`sources`) and where they go (`destination.position`: `.before(id)` or `.end`). Applying it is a nice bit of Swift to write yourself:

```swift
extension Array where Element: Identifiable {
    mutating func apply<C>(_ difference: ReorderDifference<Element.ID, C>) {
        let moving = filter { difference.sources.contains($0.id) }
        removeAll { difference.sources.contains($0.id) }
        switch difference.destination.position {
        case .before(let id):
            let index = firstIndex { $0.id == id } ?? endIndex
            insert(contentsOf: moving, at: index)
        case .end:
            append(contentsOf: moving)
        }
    }
}
```

# --instructions--

Build `HabitList` with five habits in two sections, swipe-to-delete, and a green **Done** swipe action that adds one to a habit's streak. Then make a second version with a `ScrollView` of cards that can be reordered by dragging.

# --checklist--

- My habits are `Identifiable` and show in a `List` with two sections.
- I can swipe to delete, and swipe the other way to mark a habit done.
- In the card version, I can drag cards into a new order.

# --questions--

## Why must items shown with `ForEach` be `Identifiable`?
- [x] SwiftUI uses each item's stable id to tell rows apart and animate changes
- [ ] So they can be sorted
- [ ] So they can be saved
Why: Without stable ids, SwiftUI cannot know which row moved, appeared or vanished.

---
id: nav-stack
title: NavigationStack
type: xcode
minutes: 18
---
# --description--

Most apps let you tap an item to see its details. `NavigationStack` manages that: a stack of screens, with a back button and swipe-to-go-back for free.

```swift
struct HabitsScreen: View {
    @State private var habits = Habit.samples

    var body: some View {
        NavigationStack {
            List(habits) { habit in
                NavigationLink(value: habit) {
                    Text(habit.name)
                }
            }
            .navigationTitle("Habits")
            .navigationDestination(for: Habit.self) { habit in
                HabitDetail(habit: habit)
            }
        }
    }
}
```

A `NavigationLink(value:)` says *what* to show. `.navigationDestination(for:)` says *how* to show a value of that type. Separating the two keeps big apps tidy: the list does not need to know anything about the detail screen. The value must be `Hashable`.

You can also drive navigation from code, by binding the stack to a **path**:

```swift
@State private var path: [Habit] = []

NavigationStack(path: $path) { ... }

// later, from a button:
path.append(newHabit)   // pushes its detail screen
path.removeAll()        // goes back to the root
```

Add buttons to the navigation bar with `.toolbar`:

```swift
.toolbar {
    ToolbarItem(placement: .primaryAction) {
        Button("Add", systemImage: "plus") { addHabit() }
    }
}
```

> **Note** In iOS 27, the toolbar adapts more carefully when space is tight, which matters now that iPhone apps can be resized. Use `.visibilityPriority(.high)` on a toolbar group that must stay visible, and `ToolbarOverflowMenu` to send secondary actions to the overflow menu on purpose.

# --instructions--

Wrap your habit list in a `NavigationStack`. Tapping a habit should show a detail screen with its name as the title and its streak in large text. Add a **+** toolbar button that adds a habit and immediately navigates to it, using a navigation path.

# --checklist--

- Tapping a habit shows its detail screen, with a working back button.
- The list uses `NavigationLink(value:)` and `.navigationDestination(for:)`.
- The + button adds a habit and opens it by appending to the path.

# --questions--

## What does `.navigationDestination(for: Habit.self)` do?
- [x] Says which view to show when a `Habit` value is pushed onto the stack
- [ ] Creates a habit
- [ ] Sorts the list
Why: Links say what; destinations say how.

---
id: nav-split-tabs
title: Split views and tabs
type: xcode
minutes: 18
---
# --description--

## NavigationSplitView

On iPad and Mac there is room for more than one column. `NavigationSplitView` shows a sidebar and a detail area side by side, and automatically collapses into a stack on iPhone:

```swift
struct LibraryView: View {
    @State private var selection: Book.ID?
    let books: [Book]

    var body: some View {
        NavigationSplitView {
            List(books, selection: $selection) { book in
                Text(book.title)
            }
            .navigationTitle("Books")
        } detail: {
            if let id = selection, let book = books.first(where: { $0.id == id }) {
                BookDetail(book: book)
            } else {
                ContentUnavailableView("Pick a book", systemImage: "book")
            }
        }
    }
}
```

`ContentUnavailableView` is the standard way to show an empty state.

## TabView

Tabs give an app a few top-level sections:

```swift
TabView {
    Tab("Today", systemImage: "sun.max") {
        TodayView()
    }
    Tab("Habits", systemImage: "checklist") {
        HabitsScreen()
    }
    Tab(role: .search) {
        SearchView()
    }
}
```

On iPhone, tabs sit in a floating Liquid Glass bar at the bottom. On iPad and Mac, `.tabViewStyle(.sidebarAdaptable)` lets the same tabs become a sidebar. A tab with `role: .search` gets the system's search treatment, and new in iOS 27, `Tab(role: .prominent)` visually sets one tab apart from the others.

# --instructions--

Give your habits app two tabs: **Today** (habits not yet done today) and **All habits**. On iPad, try a `NavigationSplitView` for All habits, with an empty state when nothing is selected.

# --checklist--

- My app has a `TabView` with two tabs and SF Symbols.
- On iPad, All habits shows a sidebar and a detail column.
- The detail column shows `ContentUnavailableView` when nothing is selected.

# --questions--

## What does `NavigationSplitView` do on iPhone?
- [ ] Shows both columns squeezed together
- [x] Collapses into a single navigation stack
- [ ] Does not work
Why: One declaration adapts to every size.

---
id: nav-presenting
title: Sheets, alerts and confirmation dialogs
type: xcode
minutes: 15
---
# --description--

Sometimes you show something on top of the current screen rather than navigating to it.

A **sheet** slides up a separate screen, ideal for a short task like adding an item. Drive it with an optional item: the sheet appears when the item is set, and SwiftUI sets it back to `nil` when the sheet is dismissed:

```swift
@State private var editing: Habit?

List(habits) { habit in
    Button(habit.name) { editing = habit }
}
.sheet(item: $editing) { habit in
    EditHabitView(habit: habit)
        .presentationDetents([.medium, .large])
}
```

Inside the sheet, `@Environment(\.dismiss) private var dismiss` gives you `dismiss()` to close it.

An **alert** interrupts with something important. A **confirmation dialog** asks the person to choose between actions, usually before something destructive. New in iOS 27 and macOS 27, both accept an optional item binding, exactly like sheets, so you no longer need a separate `Bool`:

```swift
@State private var habitToDelete: Habit?

.confirmationDialog("Delete habit?", item: $habitToDelete) { habit in
    Button("Delete \(habit.name)", role: .destructive) {
        delete(habit)
    }
}

.alert("Could not save", item: $saveError) { _ in
    Button("OK") { }
}
```

Use these sparingly. An alert should be rare enough that people read it.

# --instructions--

Add an **Edit** sheet for a habit that lets you rename it, with **Cancel** and **Save** buttons in its toolbar. Ask for confirmation with a confirmation dialog before deleting a habit with a streak longer than 7 days.

# --checklist--

- Tapping a habit opens an edit sheet with medium and large detents.
- Save renames the habit and closes the sheet; Cancel closes it without changes.
- Deleting a long-streak habit asks first, using an item-driven confirmation dialog.

# --questions--

## How does `.sheet(item: $editing)` know when to close?
- [x] When `editing` becomes `nil`; SwiftUI also sets it to `nil` when the person dismisses the sheet
- [ ] After three seconds
- [ ] Only when you call a method
Why: The binding is the single source of truth for whether the sheet is shown.

---
id: nav-quiz
title: "Quiz: lists and navigation"
type: quiz
minutes: 4
---
# --description--

Four questions on lists and navigation.

# --questions--

## What does a `NavigationLink(value:)` need its value to be?
- [x] `Hashable`
- [ ] A `String`
- [ ] A view
Why: The stack's path stores values, which must be hashable.

## Which view shows a sidebar and detail on iPad and Mac, and a stack on iPhone?
- [ ] `TabView`
- [x] `NavigationSplitView`
- [ ] `List`
Why: It adapts its columns to the available space.

## In iOS 27, how do you add swipe actions to cards in a `ScrollView`?
- [ ] You cannot: only `List` supports them
- [x] Add `.swipeActions` to the cards and `.swipeActionsContainer()` to the scroll view
- [ ] Wrap each card in a `List`
Why: iOS 27 brought swipe actions to any scrolling container.

## What is the best way to show an empty detail column?
- [x] `ContentUnavailableView`
- [ ] An empty `Text("")`
- [ ] An alert
Why: It is the system's standard empty state.
