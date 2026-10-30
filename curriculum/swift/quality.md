---
id: quality-unit-tests
title: Testing your app's logic
type: xcode
minutes: 18
---
# --description--

You wrote tests for a package in Modern Swift. Apps test the same way. A new project made with the **Swift Testing** option already has a test target; otherwise add one with **File › New › Target › Unit Testing Bundle**.

Test the parts that hold your app's rules, not its views:

```swift
import Testing
@testable import Habits

@Suite("Streaks")
struct StreakTests {
    let calendar = Calendar(identifier: .gregorian)

    func day(_ n: Int) -> Date {
        calendar.date(from: DateComponents(year: 2026, month: 10, day: n))!
    }

    @Test func threeDaysInARow() {
        let streak = Streak.length(of: [day(1), day(2), day(3)], endingOn: day(3), calendar: calendar)
        #expect(streak == 3)
    }

    @Test func aGapBreaksTheStreak() {
        let streak = Streak.length(of: [day(1), day(3)], endingOn: day(3), calendar: calendar)
        #expect(streak == 1)
    }
}
```

Notice that the function takes the calendar and the end date as parameters, instead of reading `Date.now`. Code that depends on "now" is hard to test; code that is *given* the date is easy. Designing for testability usually makes code better anyway.

For SwiftData models, create an in-memory container in the test, so each test starts from nothing:

```swift
let container = try ModelContainer(for: Habit.self, configurations: ModelConfiguration(isStoredInMemoryOnly: true))
let context = ModelContext(container)
```

# --checklist--

- My Habits app's streak logic has at least five Swift Testing tests.
- The streak functions take the date and calendar as parameters.
- ⌘U runs every test, and they pass.

# --questions--

## Why pass the date into a function rather than reading `Date.now` inside it?
- [x] Tests can choose the date, so the result is predictable
- [ ] `Date.now` is slow
- [ ] Swift Testing forbids `Date.now`
Why: Code that is given its inputs is easy to test.

---
id: quality-ui-tests
title: UI tests and accessibility audits
type: xcode
minutes: 15
---
# --description--

**UI tests** drive your real app the way a person would: tapping, typing, swiping, and checking what appears. They use the XCTest framework's `XCUIApplication`:

```swift
import XCTest

final class HabitsUITests: XCTestCase {
    func testAddingAHabit() throws {
        let app = XCUIApplication()
        app.launch()

        app.buttons["Add"].tap()
        let field = app.textFields["Name"]
        field.tap()
        field.typeText("Stretch")
        app.buttons["Save"].tap()

        XCTAssertTrue(app.staticTexts["Stretch"].exists)
    }

    func testAccessibility() throws {
        let app = XCUIApplication()
        app.launch()
        try app.performAccessibilityAudit()
    }
}
```

Elements are found by their labels, the same labels VoiceOver reads, so a well-labelled app is also an easy app to test.

`performAccessibilityAudit()` checks the current screen for common problems: missing labels, text that does not scale, poor contrast, and controls too small to tap. Run it on each important screen.

UI tests are slower than unit tests, so keep them for your app's most important journeys, and test logic with unit tests.

> **Tip** Click the record button at the bottom of the editor while a UI test function is selected, use your app, and Xcode writes the test code for you. Tidy it up afterwards.

# --checklist--

- A UI test adds a habit and checks it appears.
- An accessibility audit runs on my main screen, and I fixed what it found.

# --questions--

## How do UI tests usually find buttons and text?
- [x] By their accessibility labels
- [ ] By their colour
- [ ] By their position in pixels
Why: Good labels serve VoiceOver users and tests alike.

---
id: quality-debugging
title: Debugging
type: xcode
minutes: 18
---
# --description--

Every programmer spends much of their time finding out why something does not work. Xcode gives you good tools for it.

**Breakpoints.** Click a line number in the editor to add a breakpoint. When the running app reaches that line, it pauses, and the debug area shows every variable's value. Step over a line with F6, step into a function with F7, and continue with ⌃⌘Y.

**The console.** While paused, type commands at the `(lldb)` prompt:

```
p habit.name
po habits.count
```

`p` prints a value; `po` prints an object's description. You can even change values, `expression streak = 10`, to try a theory without rebuilding.

**Conditional breakpoints.** Right-click a breakpoint, choose **Edit Breakpoint**, and add a condition like `habit.name == "Read"` so it only stops when it matters.

**The view debugger.** Click **Debug View Hierarchy** in the debug bar to see your interface exploded into 3D layers. It shows why a view is hidden, clipped, or the wrong size.

**Logging.** `print` is fine for a quick look. For logs you keep, use `Logger` from the `os` framework, which is fast, has levels, and keeps private data private:

```swift
import os

let log = Logger(subsystem: "com.yourname.Habits", category: "sync")
log.info("Synced \(count) habits")
log.error("Sync failed: \(error.localizedDescription, privacy: .public)")
```

The best debugging habit is not a tool: change one thing at a time, and check what happened.

# --checklist--

- I paused my app at a breakpoint and looked at its variables.
- I printed a value with `p` at the LLDB prompt.
- I used the view debugger to inspect a screen.
- My app logs with `Logger` instead of `print`.

# --questions--

## What does a breakpoint do?
- [x] Pauses the running app at that line, so you can inspect its state
- [ ] Stops the build
- [ ] Deletes the line
Why: You see exactly what your code sees.

---
id: quality-performance
title: Performance with Instruments
type: xcode
minutes: 18
---
# --description--

When an app stutters, drains the battery or starts slowly, **Instruments** shows you why. Choose **Product › Profile** (⌘I) to build for profiling and open it.

Templates worth knowing:

| Template | Finds |
| --- | --- |
| **Time Profiler** | Where the CPU spends its time |
| **SwiftUI** | Views whose bodies run too often or too slowly |
| **Hangs** | Moments the main actor was blocked and the app froze |
| **Allocations** and **Leaks** | Memory growth and retain cycles |

Record while you use the slow part of your app, then stop and select the slow stretch of the timeline. In Instruments 27, **Top Functions** lists where the time went in just that stretch, and Quick Open (⇧⌘O) jumps straight to the function in your code.

The usual SwiftUI fixes:

- Move heavy work out of `body`: compute it once in the model, not on every redraw.
- Mark genuinely slow work `@concurrent`, so it runs off the main actor.
- Use `LazyVStack` or `List` for long lists, so only visible rows are made.
- Keep `@Observable` models granular, so a change only redraws the views that read it.

Then profile again, to check the fix worked. Xcode 27's Organizer shows the same kinds of problems from real users' devices once your app ships, with **Metric Goals** for launch time, hangs, hitches, battery and storage.

# --checklist--

- I profiled my app with the Time Profiler and found its busiest function.
- I checked a long list with the SwiftUI instrument.
- I profiled again after a change, to confirm it helped.

# --questions--

## Your app freezes for a moment when a screen opens. Which instrument shows why?
- [ ] Leaks
- [x] Hangs, or the Time Profiler
- [ ] Allocations
Why: A freeze is the main actor being blocked.

---
id: quality-localization
title: Speaking every language
type: xcode
minutes: 15
---
# --description--

Apple's platforms are used in nearly every country. Supporting more languages is one of the best ways to reach more people, and Xcode makes it straightforward.

SwiftUI text written as literals, like `Text("Today")`, is **localizable** already. Add a **String Catalog** with **File › New › File › String Catalog**, and when you build, Xcode collects every string from your code into it.

In Xcode 27 you can let the coding assistant prepare your project: it finds strings, sets up the catalog, and translates. In the String Catalog, the **Generate Translations** button adds a language for you. Treat machine translations as a draft: have a native speaker review them, and run the app in each language to check nothing is cut off.

Plurals are handled per language, which matters because languages count differently:

```swift
Text("\(count) habits")   // the catalog lets you vary this for 1, 2, few, many…
```

Format numbers, dates and currencies with Swift's formatters, so they follow each region's conventions:

```swift
Text(price, format: .currency(code: "EUR"))
Text(date, format: .dateTime.day().month(.wide))
```

To try a language, edit your scheme's **Run › Options › App Language**, or set it in Device Hub.

# --checklist--

- My app has a String Catalog with every visible string.
- I added a second language and ran the app in it.
- Numbers and dates use formatters.

# --questions--

## Why use `.currency(code:)` rather than writing "€" yourself?
- [x] Formatters follow each region's conventions for symbols, spacing and separators
- [ ] It is shorter
- [ ] The euro sign is not allowed
Why: "€12.50" and "12,50 €" are both correct, in different places.

---
id: quality-quiz
title: "Quiz: quality"
type: quiz
minutes: 3
---
# --description--

Three questions on quality.

# --questions--

## What should unit tests mostly cover?
- [x] Your app's logic and rules
- [ ] The colours of views
- [ ] Apple's frameworks
Why: Logic is where bugs hide, and it is fast to test.

## What does `try app.performAccessibilityAudit()` do in a UI test?
- [ ] Turns on VoiceOver
- [x] Checks the current screen for common accessibility problems
- [ ] Makes text larger
Why: An automated first pass, before testing by hand.

## Which shortcut builds your app and opens it in Instruments?
- [ ] ⌘R
- [x] ⌘I
- [ ] ⌘U
Why: Product › Profile.
