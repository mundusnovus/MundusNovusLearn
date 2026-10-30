---
id: mac-scenes
title: Windows and scenes on the Mac
type: xcode
minutes: 18
---
# --description--

The SwiftUI you know runs on the Mac. What makes an app feel truly at home there is how it uses **windows**, **menus** and the **keyboard**. You describe these with **scenes** in your `App`:

```swift
@main
struct NotesApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .frame(minWidth: 600, minHeight: 400)
        }

        Window("Statistics", id: "stats") {
            StatsView()
        }
        .keyboardShortcut("0", modifiers: [.command, .shift])

        Settings {
            SettingsView()
        }

        MenuBarExtra("Notes", systemImage: "note.text") {
            QuickNoteView()
        }
        .menuBarExtraStyle(.window)
    }
}
```

- **`WindowGroup`** can open many windows of the same kind: ⌘N makes another.
- **`Window`** is a single, unique window. Open it from code with `@Environment(\.openWindow)`, then `openWindow(id: "stats")`.
- **`Settings`** gives your app a proper **Settings…** item in the app menu, with ⌘, as its shortcut.
- **`MenuBarExtra`** adds an item to the menu bar at the top of the screen. With `.menuBarExtraStyle(.window)` it opens a small window of SwiftUI.

To add a Mac version of an existing iOS app, select your project, choose the target, and add **Mac** under **Supported Destinations**. Then adapt where the Mac deserves something better: sidebars, menus, keyboard shortcuts, pointer hover.

# --checklist--

- My Mac app has a main window with a minimum size, and ⌘N opens another.
- It has a Settings scene, opened with ⌘,.
- It has a menu bar extra.

# --questions--

## Which scene gives your app a Settings… menu item and ⌘, shortcut?
- [ ] `WindowGroup`
- [x] `Settings`
- [ ] `MenuBarExtra`
Why: The `Settings` scene is built for app preferences.

---
id: mac-menus
title: Menus and keyboard shortcuts
type: xcode
minutes: 15
---
# --description--

Mac users live on the keyboard and the menu bar. Every important action should be in a menu, and the common ones should have shortcuts.

Add commands to the menu bar with `.commands` on a scene:

```swift
WindowGroup {
    ContentView()
}
.commands {
    CommandMenu("Note") {
        Button("New Note") { store.newNote() }
            .keyboardShortcut("n", modifiers: [.command, .option])
        Button("Pin Note") { store.togglePin() }
            .keyboardShortcut("p", modifiers: [.command, .shift])
        Divider()
        Button("Delete Note", role: .destructive) { store.deleteSelected() }
            .keyboardShortcut(.delete, modifiers: .command)
    }
    CommandGroup(after: .newItem) {
        Button("Import…") { store.showImporter = true }
    }
}
```

`CommandMenu` adds a whole new menu; `CommandGroup` adds items to an existing one, such as after **File › New**.

Keyboard shortcuts work on views too, including buttons in toolbars: `.keyboardShortcut(.defaultAction)` makes a button respond to Return.

The menu bar also shows minimal icons beside items by default on macOS 27. If an item deserves its icon, give its label `.labelStyle(.titleAndIcon)`.

Look at a polished Mac app you love, open each menu, and notice how much lives there. Your app should feel the same.

# --checklist--

- My app has a Note menu with three commands and shortcuts.
- An Import… item appears in the File menu after New.

# --questions--

## What is the difference between `CommandMenu` and `CommandGroup`?
- [x] `CommandMenu` adds a new menu; `CommandGroup` adds items to an existing menu
- [ ] They are the same
- [ ] `CommandGroup` removes items
Why: Use the system's menus where they fit, and your own where they do not.

---
id: mac-documents
title: Document-based apps
type: xcode
minutes: 18
---
# --description--

Some apps are about **documents**: files people create, name, save anywhere, and open again. SwiftUI's `DocumentGroup` gives you the whole system experience: open and save panels, recent documents, duplicate, rename, versions, and iCloud Drive.

With SwiftData, a document app is a short step from what you know:

```swift
@main
struct SketchbookApp: App {
    var body: some Scene {
        DocumentGroup(editing: Page.self, contentType: .sketchbook) {
            PageEditor()
        }
    }
}
```

`contentType` is a **uniform type identifier**: the type of file your app owns. You declare it in your target's **Info › Exported Type Identifiers**, with a file extension such as `.sketchbook`, and in code:

```swift
import UniformTypeIdentifiers

extension UTType {
    static let sketchbook = UTType(exportedAs: "com.yourname.sketchbook")
}
```

New in iOS 27 and macOS 27, document apps can offer several ways to start a document, from a blank page or from a photo for example, with `DocumentCreationSource` and `NewDocumentButton` in a document launch scene. And documents that are not SwiftData can separate the model from writing to disk with `WritableDocument`, so saving happens off the main actor while you keep typing.

# --checklist--

- My app declares its own document type with a file extension.
- I can create, save, close and reopen a document, and see it in Recent documents.

# --questions--

## What does `DocumentGroup` give you for free?
- [x] Open and save panels, recent documents, renaming, versions and iCloud Drive
- [ ] A database server
- [ ] A text editor
Why: The system document experience comes with the scene.

---
id: mac-appkit-sandbox
title: AppKit and the sandbox
type: xcode
minutes: 15
---
# --description--

## When SwiftUI is not enough

SwiftUI covers most needs, but the Mac's older framework, **AppKit**, still has views SwiftUI lacks. Wrap one with `NSViewRepresentable`:

```swift
import AppKit

struct ColorWell: NSViewRepresentable {
    @Binding var color: NSColor

    func makeNSView(context: Context) -> NSColorWell {
        let well = NSColorWell()
        well.target = context.coordinator
        well.action = #selector(Coordinator.changed(_:))
        return well
    }

    func updateNSView(_ well: NSColorWell, context: Context) {
        well.color = color
    }

    func makeCoordinator() -> Coordinator { Coordinator(color: $color) }

    final class Coordinator: NSObject {
        var color: Binding<NSColor>
        init(color: Binding<NSColor>) { self.color = color }
        @objc func changed(_ sender: NSColorWell) { color.wrappedValue = sender.color }
    }
}
```

`make` creates the AppKit view once; `update` pushes SwiftUI's state into it; the **coordinator** carries changes back. On iOS, `UIViewRepresentable` does the same for UIKit.

## The App Sandbox

Mac apps from the App Store run in the **App Sandbox**: they can only reach their own container unless they ask. Under **Signing & Capabilities › App Sandbox**, tick what your app needs: outgoing network connections, files the user selects, the camera, and so on. Files a person chooses in an open panel are always allowed, which is why document apps work naturally in the sandbox.

Ask for as little as you can. App Review checks that each entitlement is needed.

# --questions--

## In `NSViewRepresentable`, what does `updateNSView` do?
- [x] Pushes the current SwiftUI state into the AppKit view whenever it changes
- [ ] Creates the view
- [ ] Deletes the view
Why: Make once; update many times.

## Your sandboxed app cannot connect to a server. What is likely missing?
- [ ] An internet cable
- [x] The Outgoing Connections (Client) entitlement
- [ ] Sign in with Apple
Why: The sandbox blocks network access unless you ask for it.

---
id: mac-quiz
title: "Quiz: Mac apps"
type: quiz
minutes: 3
---
# --description--

Three questions on Mac apps.

# --questions--

## Which scene makes a single, unique window you open by id?
- [x] `Window`
- [ ] `WindowGroup`
- [ ] `DocumentGroup`
Why: `WindowGroup` can make many; `Window` makes one.

## Where should every important action in a Mac app be?
- [ ] Only in the toolbar
- [x] In a menu, with a shortcut for the common ones
- [ ] Only in a right-click menu
Why: The menu bar is how Mac users discover and repeat actions.

## What does the App Sandbox do?
- [x] Limits the app to its own container and the abilities it asks for
- [ ] Makes the app run faster
- [ ] Hides the app from Spotlight
Why: It protects people from apps that overreach.
