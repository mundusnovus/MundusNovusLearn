---
id: data-appstorage
title: Small settings with @AppStorage
type: xcode
minutes: 10
---
# --description--

Everything in an `@Observable` model disappears when the app quits. The simplest kind of saving is for small settings, like a preferred theme or whether someone has seen the welcome screen. `@AppStorage` works like `@State`, but saves to `UserDefaults`, the system's store for preferences:

```swift
struct SettingsView: View {
    @AppStorage("showStreaks") private var showStreaks = true
    @AppStorage("reminderHour") private var reminderHour = 9

    var body: some View {
        Form {
            Toggle("Show streaks", isOn: $showStreaks)
            Stepper("Remind me at \(reminderHour):00", value: $reminderHour, in: 0...23)
        }
    }
}
```

The string is the key it is saved under. Any view using the same key sees the same value, and updates when it changes.

Use `@AppStorage` for a handful of simple values: numbers, strings, Bools, dates. It is not a database. For your app's real data, use SwiftData.

# --checklist--

- My Habits app has a settings screen using `@AppStorage`.
- Settings survive quitting and reopening the app.

# --questions--

## What is `@AppStorage` good for?
- [x] A few small settings that should survive restarts
- [ ] Storing thousands of records
- [ ] Sharing data between devices
Why: It wraps `UserDefaults`, which is for preferences.

---
id: data-swiftdata
title: SwiftData models
type: xcode
minutes: 20
---
# --description--

**SwiftData** stores your app's objects in a database on the device, with almost no code. Turn a class into a stored model with `@Model`:

```swift
import SwiftData

@Model
final class Habit {
    var name: String
    var symbol: String
    var createdAt: Date
    @Relationship(deleteRule: .cascade) var completions: [Completion] = []

    init(name: String, symbol: String) {
        self.name = name
        self.symbol = symbol
        self.createdAt = .now
    }
}

@Model
final class Completion {
    var day: Date
    var habit: Habit?

    init(day: Date) { self.day = day }
}
```

`@Model` makes the class observable, like `@Observable`, and teaches SwiftData to save it. `@Relationship(deleteRule: .cascade)` says that deleting a habit deletes its completions too.

Tell the app which models it stores, with a **model container**:

```swift
@main
struct HabitsApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: Habit.self)   // related models are included
    }
}
```

That is all the setup. The database is created on first launch and opened every launch after.

> **Tip** In a new project, choose **Storage › SwiftData** in Xcode's template to get this set up for you, with an example model.

# --checklist--

- My Habits app's model types are `@Model` classes.
- The app has a `.modelContainer(for:)`.
- Deleting a habit deletes its completions.

# --questions--

## What does `@Model` add to a class?
- [x] Saving in SwiftData, and observation like `@Observable`
- [ ] A user interface
- [ ] Network syncing
Why: Models are both persistent and observable.

---
id: data-query
title: Reading and changing data
type: xcode
minutes: 20
---
# --description--

Views read models with `@Query`. It fetches from the database and keeps the view up to date as data changes:

```swift
struct HabitList: View {
    @Query(sort: \Habit.createdAt) private var habits: [Habit]
    @Environment(\.modelContext) private var context

    var body: some View {
        List {
            ForEach(habits) { habit in
                Text(habit.name)
            }
            .onDelete { offsets in
                for index in offsets {
                    context.delete(habits[index])
                }
            }
        }
        .toolbar {
            Button("Add", systemImage: "plus") {
                context.insert(Habit(name: "New habit", symbol: "star"))
            }
        }
    }
}
```

The **model context** is your handle on the database: `insert` adds, `delete` removes. Changing a model's properties is just assignment: `habit.name = "Read"`. SwiftData saves automatically.

Filter with a **predicate**, written as ordinary Swift:

```swift
@Query(filter: #Predicate<Habit> { $0.name.contains("Read") }, sort: \Habit.name)
private var readingHabits: [Habit]
```

For previews, use an in-memory container with sample data, so previews never touch your real database:

```swift
#Preview {
    HabitList()
        .modelContainer(for: Habit.self, inMemory: true)
}
```

# --instructions--

Move your Habits project from its `@Observable` model to SwiftData: `@Model` classes, a model container, `@Query` in the list, and inserts and deletes through the model context. Make sure completions and streaks still work.

# --checklist--

- Habits and completions survive quitting the app.
- The list uses `@Query` and stays up to date when I add, change or delete.
- Previews use an in-memory container.

# --questions--

## How do you save a change to a model's property in SwiftData?
- [x] Just assign it; SwiftData saves automatically
- [ ] Call `save()` after every change
- [ ] Delete and re-insert the model
Why: Models are tracked by their context.

## Why give previews an in-memory container?
- [ ] It is faster to type
- [x] So previews never change the real database
- [ ] Previews cannot use SwiftData otherwise
Why: Sample data stays in the preview.

---
id: data-quiz
title: "Quiz: data"
type: quiz
minutes: 3
---
# --description--

Three questions on keeping data.

# --questions--

## Which tool fits a list of 5,000 journal entries?
- [ ] `@AppStorage`
- [x] SwiftData
- [ ] `@State`
Why: SwiftData is a real database; the others are not.

## What does `@Query(sort: \Habit.name)` give a view?
- [x] Every saved habit, sorted by name, kept up to date
- [ ] One habit
- [ ] A count of habits
Why: Queries fetch and observe.

## What does `deleteRule: .cascade` on a relationship do?
- [ ] Nothing
- [x] Deletes the related objects when this object is deleted
- [ ] Prevents deleting the object
Why: Completions should not outlive their habit.
