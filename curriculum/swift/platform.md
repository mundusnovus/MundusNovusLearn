---
id: platform-intents
title: App Intents, Siri and Shortcuts
type: xcode
minutes: 20
---
# --description--

**App Intents** describe the things your app can do, so the rest of the system can do them too: Siri, the Shortcuts app, Spotlight, the Action button, widgets and controls. In iOS 27, App Intents is *the* way apps work with Siri; the older SiriKit is being retired.

An intent is a struct with a title and a `perform` method:

```swift
import AppIntents

struct LogHabitIntent: AppIntent {
    static let title: LocalizedStringResource = "Log a Habit"

    @Parameter(title: "Habit")
    var habitName: String

    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await HabitStore.shared.complete(named: habitName)
        return .result(dialog: "Done. Keep it up!")
    }
}
```

`@Parameter` marks an input the system can ask for. To make it available the moment your app is installed, with phrases people can say, add an **app shortcut**:

```swift
struct HabitShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: LogHabitIntent(),
            phrases: ["Log a habit in \(.applicationName)"],
            shortTitle: "Log Habit",
            systemImageName: "checkmark.circle"
        )
    }
}
```

Every phrase must include the app's name. Now "Hey Siri, log a habit in Habits" works, and the action appears in Shortcuts and Spotlight.

Intents run their code in your app's process, often without showing any interface, so keep your model logic separate from your views. That is one more reason the course has asked you to keep logic in the model.

# --checklist--

- My Habits app has an intent that logs a habit by name.
- An app shortcut makes it available in Shortcuts and to Siri.
- I ran it from the Shortcuts app and with Siri.

# --questions--

## Why must every app shortcut phrase include `\(.applicationName)`?
- [x] So the system knows which app the request is for
- [ ] It is optional decoration
- [ ] To translate the phrase
Why: Many apps could answer "log a habit".

---
id: platform-widgets
title: Widgets
type: xcode
minutes: 25
---
# --description--

Widgets put a glance of your app on the Home Screen, Lock Screen, Mac desktop, in StandBy and on Apple Watch. They are SwiftUI views, but they do not run all the time: the system asks your widget for a **timeline** of entries, and shows each at its time.

Add one with **File › New › Target › Widget Extension**. The template gives you three parts.

An **entry**: the data for one moment.

```swift
struct StreakEntry: TimelineEntry {
    let date: Date
    let streak: Int
}
```

A **provider**: makes entries.

```swift
struct StreakProvider: TimelineProvider {
    func placeholder(in context: Context) -> StreakEntry {
        StreakEntry(date: .now, streak: 7)
    }

    func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> Void) {
        let entry = StreakEntry(date: .now, streak: SharedStore.currentStreak())
        let midnight = Calendar.current.startOfDay(for: .now.addingTimeInterval(86_400))
        completion(Timeline(entries: [entry], policy: .after(midnight)))
    }
}
```

And the **widget**: its view and configuration.

```swift
struct StreakWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "Streak", provider: StreakProvider()) { entry in
            VStack {
                Image(systemName: "flame.fill")
                Text("\(entry.streak)").font(.largeTitle.bold())
                Text("day streak").font(.caption)
            }
            .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Streak")
        .supportedFamilies([.systemSmall, .accessoryCircular])
    }
}
```

The widget is a separate process, so it cannot read your app's memory. Share data through an **App Group**: add the App Groups capability to both targets, then point SwiftData or `UserDefaults(suiteName:)` at the group. When the app changes the data, call `WidgetCenter.shared.reloadAllTimelines()`. Buttons in widgets run App Intents, so a widget can log a habit without opening the app.

> **Apple Developer Program** App Groups need a team identifier. They work with a free account while you develop, and fully with the membership.

# --checklist--

- My app has a widget extension that shows the current streak.
- App and widget share data through an App Group.
- The widget updates after I log a habit in the app.

# --questions--

## Why does a widget need an App Group to read the app's data?
- [x] The widget runs as a separate process and cannot see the app's memory or files otherwise
- [ ] Widgets cannot use SwiftUI
- [ ] For iCloud syncing
Why: App Groups give both a shared container.

---
id: platform-notifications
title: Notifications
type: xcode
minutes: 15
---
# --description--

Local notifications remind people of something at a time, without a server. First, ask permission, at a moment when the reason is obvious, such as when someone turns on reminders:

```swift
import UserNotifications

func enableReminders() async -> Bool {
    let center = UNUserNotificationCenter.current()
    return (try? await center.requestAuthorization(options: [.alert, .sound, .badge])) ?? false
}
```

Then schedule one:

```swift
func scheduleDailyReminder(hour: Int) async throws {
    let content = UNMutableNotificationContent()
    content.title = "Time for your habits"
    content.body = "A minute now keeps the streak going."
    content.sound = .default

    var when = DateComponents()
    when.hour = hour
    let trigger = UNCalendarNotificationTrigger(dateMatching: when, repeats: true)

    let request = UNNotificationRequest(identifier: "daily", content: content, trigger: trigger)
    try await UNUserNotificationCenter.current().add(request)
}
```

Reusing the identifier `"daily"` replaces the previous reminder rather than adding another.

Notifications are a privilege. Send few, make each one useful, and let people choose the time.

> **Apple Developer Program** Local notifications work with a free account. **Push** notifications, sent from a server, need the membership and an Apple Push Notification service key.

# --checklist--

- My settings screen asks for permission when reminders are turned on.
- A daily reminder arrives at the hour chosen with `@AppStorage`.

# --questions--

## When is the best moment to ask for notification permission?
- [ ] The first time the app opens
- [x] When the person turns on a feature that needs it
- [ ] Never: notifications need no permission
Why: People say yes when they understand why.

---
id: platform-foundation-models
title: On-device AI with Foundation Models
type: xcode
minutes: 20
---
# --description--

The **Foundation Models** framework gives your app the large language model at the core of Apple Intelligence, running entirely **on the device**: private, offline and free to use, with no server and no API key.

```swift
import FoundationModels

func encouragement(for habit: String, streak: Int) async throws -> String {
    let session = LanguageModelSession(instructions: "You write one short, warm sentence of encouragement.")
    let response = try await session.respond(to: "Someone has kept up \(habit) for \(streak) days.")
    return response.content
}
```

Even better, the model can fill in your own Swift types, so you never parse text by hand. Mark a type `@Generable`, and describe its properties with `@Guide`:

```swift
@Generable
struct HabitIdea {
    @Guide(description: "A short name for the habit, two or three words")
    let name: String
    @Guide(description: "An SF Symbol name that suits it")
    let symbol: String
}

let session = LanguageModelSession()
let idea = try await session.respond(to: "Suggest a habit for someone who wants to sleep better.", generating: HabitIdea.self).content
```

The model is not on every device: it needs Apple Intelligence to be available and turned on. Check before showing the feature:

```swift
switch SystemLanguageModel.default.availability {
case .available:
    showSuggestionsButton = true
default:
    showSuggestionsButton = false
}
```

Treat its answers as suggestions the person can edit, never as facts.

# --checklist--

- My app checks the model's availability before offering AI features.
- A button suggests a new habit as a `@Generable` value that fills in the add sheet.

# --questions--

## What is special about the Foundation Models framework?
- [x] The model runs on the device: private, offline and with no server cost
- [ ] It needs an API key
- [ ] It only works on the Mac
Why: That is what sets it apart from cloud AI services.

---
id: platform-quiz
title: "Quiz: the system"
type: quiz
minutes: 3
---
# --description--

Three questions on platform features.

# --questions--

## How does Siri perform actions in your app on iOS 27?
- [x] Through App Intents
- [ ] Through SiriKit only
- [ ] It cannot
Why: App Intents is now the way to work with Siri.

## How often does a widget run its code?
- [ ] All the time
- [x] When the system asks for a timeline, and when the app asks it to reload
- [ ] Every second
Why: Widgets show prepared entries to save battery.

## What does `@Generable` let the on-device model do?
- [ ] Generate images
- [x] Fill in an instance of your own Swift type
- [ ] Run faster
Why: Structured output, with no text parsing.
