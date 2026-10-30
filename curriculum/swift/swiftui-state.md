---
id: state-state
title: "@State"
type: xcode
minutes: 15
---
# --description--

Views are structs, and a view's `body` is recomputed often, so ordinary properties cannot hold anything that changes. When a view needs its own changing value, mark the property `@State`:

```swift
struct CounterView: View {
    @State private var count = 0

    var body: some View {
        VStack(spacing: 20) {
            Text("\(count)")
                .font(.system(size: 72, weight: .bold))
                .contentTransition(.numericText())
            Button("Add one") {
                count += 1
            }
            .buttonStyle(.glassProminent)
        }
    }
}
```

When `count` changes, SwiftUI notices, recomputes `body`, and updates only what changed on screen. You never redraw anything yourself.

Rules of thumb:

- Make `@State` properties `private`. They belong to this view alone.
- Give them a starting value where they are declared. In Xcode 27, `@State` is a macro, and it reports an error if you also set a different value in `init`.
- Keep state as small as possible, and derive everything else. If you can compute a value from other state, make it a computed property, not more state.

> **Note** In iOS 27 and macOS 27, `@State` creates its value once per view lifetime, even when the parent view is recreated. This matters when the value is an object, as you will see shortly.

# --instructions--

Build `CounterView` in a new project or a playground. Then add a **Reset** button that sets the count back to `0`, but is disabled while the count is already `0`, using `.disabled(count == 0)`.

# --checklist--

- Tapping Add one increases the number, with a smooth numeric animation.
- Reset sets it back to zero.
- Reset is disabled when the count is zero.

# --questions--

## Why can't a view use a plain `var` for a value that changes?
- [x] Views are structs that SwiftUI recreates often; `@State` keeps the value alive and tells SwiftUI to update
- [ ] Plain `var` properties are not allowed in structs
- [ ] It would be too slow
Why: `@State` gives the value storage outside the struct and makes changes visible.

---
id: state-binding
title: Bindings and controls
type: xcode
minutes: 18
---
# --description--

Controls like text fields and toggles both **show** a value and **change** it. They need a two-way connection to your state, called a **binding**. Put `$` in front of a state property to get its binding:

```swift
struct SignUpView: View {
    @State private var name = ""
    @State private var wantsNews = true
    @State private var age = 18.0
    @State private var plan = "Free"

    var body: some View {
        Form {
            TextField("Your name", text: $name)
            Toggle("Send me news", isOn: $wantsNews)
            Slider(value: $age, in: 13...100, step: 1) {
                Text("Age")
            }
            Text("Age: \(Int(age))")
            Picker("Plan", selection: $plan) {
                Text("Free").tag("Free")
                Text("Supporter").tag("Supporter")
            }
        }
    }
}
```

`name` is the value; `$name` is a binding to it. The text field reads through the binding to show the text and writes through it as you type.

`Form` arranges controls the way Settings does, and adapts to each platform.

## Passing a binding down

When a child view should change its parent's state, give it a `@Binding` property. The child does not own the value; it borrows the parent's:

```swift
struct VolumeControl: View {
    @Binding var volume: Double

    var body: some View {
        Slider(value: $volume, in: 0...1)
    }
}

// in the parent:
@State private var volume = 0.5
VolumeControl(volume: $volume)
```

This is the heart of SwiftUI data flow: **one source of truth**. Each value is owned in exactly one place, with `@State`, and everything else reads it or binds to it.

# --instructions--

Build `SignUpView`, then add a **Sign up** button at the bottom that is disabled until the name is at least two characters long. Move the toggle into its own `NewsToggle` view that takes a `@Binding`.

# --checklist--

- Typing in the text field updates the name.
- The Sign up button is disabled until the name has two or more characters.
- `NewsToggle` uses `@Binding`, and the parent still owns `wantsNews` with `@State`.

# --questions--

## What does `$name` give you when `name` is a `@State` property?
- [ ] A copy of the name
- [x] A binding: a two-way connection to the state
- [ ] The name's length
Why: Controls read and write through bindings.

## A child view needs to change a value its parent owns. What should the child declare?
- [x] `@Binding var value`
- [ ] `@State private var value`
- [ ] A plain `let value`
Why: `@State` would make a separate copy; `@Binding` borrows the parent's.

---
id: state-observable
title: Shared models with @Observable
type: xcode
minutes: 20
---
# --description--

`@State` is perfect for small values that one view owns. Real apps also have a **model**: the app's data and rules, shared by many screens. Make it a class marked `@Observable`:

```swift
import Observation

@Observable
final class Library {
    var books: [Book] = []
    var filter = ""

    var visibleBooks: [Book] {
        filter.isEmpty ? books : books.filter { $0.title.localizedStandardContains(filter) }
    }

    func add(_ title: String) {
        books.append(Book(title: title))
    }
}

struct Book: Identifiable {
    let id = UUID()
    var title: String
}
```

SwiftUI tracks exactly which properties each view reads. A view that shows `books.count` updates when `books` changes, but not when `filter` does. You write no notification code at all.

## Owning and sharing a model

Create the model once, with `@State`, in the view (or app) that owns it:

```swift
@main
struct LibraryApp: App {
    @State private var library = Library()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(library)   // share it with every view below
        }
    }
}
```

Any view below can read it from the **environment**:

```swift
struct BookCount: View {
    @Environment(Library.self) private var library
    var body: some View { Text("\(library.books.count) books") }
}
```

To bind controls to an observable model's properties, use `@Bindable`:

```swift
struct FilterField: View {
    @Bindable var library: Library
    var body: some View {
        TextField("Filter", text: $library.filter)
    }
}
```

You now have the three tools for almost every app: `@State` for owning, `@Binding` and `@Bindable` for changing what someone else owns, and `@Environment` for reaching shared models from anywhere.

# --instructions--

Build `Library` and a screen that shows its visible books in a `VStack`, with a `FilterField` above and a text field plus **Add** button below. Share the library through the environment.

# --checklist--

- `Library` is an `@Observable` final class, owned with `@State` at the top.
- It is shared with `.environment(library)` and read with `@Environment(Library.self)`.
- The filter field uses `@Bindable` and filters the list as I type.

# --questions--

## How does SwiftUI know which views to update when an `@Observable` model changes?
- [x] It tracks which properties each view read, and updates only those views
- [ ] It updates every view in the app
- [ ] You call a refresh method
Why: Observation tracks reads property by property.

## Where should a shared model be created?
- [x] Once, with `@State`, in the view or app that owns it
- [ ] In every view that uses it
- [ ] In a global variable
Why: One source of truth: own it once, share it down.

---
id: state-quiz
title: "Quiz: state and data flow"
type: quiz
minutes: 4
---
# --description--

Four questions on SwiftUI data flow.

# --questions--

## Which property wrapper owns a small piece of a view's own changing state?
- [x] `@State`
- [ ] `@Binding`
- [ ] `@Environment`
Why: `@State` owns; the others borrow or look up.

## What makes a model class usable by SwiftUI views with automatic updates?
- [ ] Inheriting from `View`
- [x] Marking it `@Observable`
- [ ] Making it a struct
Why: The Observation framework tracks reads and writes.

## How do you get a binding to a property of an `@Observable` object passed into a view?
- [ ] `$object.property` works on any parameter
- [x] Declare the parameter `@Bindable`, then use `$object.property`
- [ ] Bindings only work with `@State`
Why: `@Bindable` makes bindings to an observable object's properties.

## What is "one source of truth"?
- [x] Each piece of data is owned in exactly one place, and everything else reads or binds to it
- [ ] Storing every value in one big struct
- [ ] Using only one view
Why: Two copies of the same data drift apart; one owner never does.
