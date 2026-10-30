---
id: swiftui-intro
title: How SwiftUI thinks
type: lesson
minutes: 8
---
# --description--

**SwiftUI** is Apple's way of building interfaces for every Apple platform. Instead of writing step-by-step instructions ("make a label, put it here, change its text when…"), you **describe** what the screen should look like for the current data, and SwiftUI keeps the screen matching that description as the data changes.

A screen is made of **views**. A view is a struct that conforms to `View` and has one requirement, a `body`:

```swift
import SwiftUI

struct GreetingView: View {
    var body: some View {
        Text("Hello, world!")
    }
}
```

You recognise all of this now: a struct, a protocol, a computed property, and `some View`, which means "a specific view type the compiler works out". Views are small, cheap values. SwiftUI makes and throws them away constantly; that is normal.

Every app starts at a struct marked `@main` that conforms to `App`. Its `body` holds **scenes**, such as a window:

```swift
@main
struct HelloApp: App {
    var body: some Scene {
        WindowGroup {
            GreetingView()
        }
    }
}
```

Open your **Hello** project from the last chapter: `HelloApp.swift` and `ContentView.swift` look just like this.

## Previews

At the bottom of `ContentView.swift` is a **preview**:

```swift
#Preview {
    ContentView()
}
```

The canvas (⌥⌘↩) shows it live and updates as you type. You can have several previews in a file, each showing a different state. In Xcode 27, iPhone previews have **resize handles**, because iPhone apps can now be resized on iOS 27: drag them to check your layout at different sizes.

# --questions--

## What is the one requirement of the `View` protocol?
- [ ] An initializer
- [x] A `body` property describing what the view shows
- [ ] A `draw()` method
Why: SwiftUI reads `body` to know what to show.

## What does SwiftUI do when your data changes?
- [x] Recomputes the affected views' bodies and updates the screen to match
- [ ] Nothing: you must redraw the screen yourself
- [ ] Restarts the app
Why: You describe the interface for the data; SwiftUI keeps them in step.

---
id: swiftui-text-images
title: Text, images and symbols
type: xcode
minutes: 15
---
# --description--

## Text

`Text` shows read-only text. Style it with **modifiers**, methods that return a changed copy of the view:

```swift
Text("Mundus Novus")
    .font(.largeTitle)
    .fontWeight(.bold)
    .foregroundStyle(.blue)
```

Use the built-in text styles (`.largeTitle`, `.title`, `.headline`, `.body`, `.caption` and so on) rather than fixed sizes. They grow and shrink with the reader's preferred text size, a setting many people rely on.

## Images and SF Symbols

`Image("photo")` shows an image you have added to your project's **Assets** catalogue. `Image(systemName:)` shows one of the thousands of **SF Symbols**: icons designed by Apple to match the system font, in every weight and size:

```swift
Image(systemName: "globe.americas.fill")
    .font(.system(size: 60))
    .foregroundStyle(.blue, .green)    // some symbols take several colours
    .symbolEffect(.bounce, value: tapCount)
```

Download Apple's free **SF Symbols** app to browse them all and copy their names.

Photos need sizing. `resizable()` lets an image change size, and `scaledToFit()` or `scaledToFill()` keeps its shape:

```swift
Image("lisbon")
    .resizable()
    .scaledToFill()
    .frame(height: 200)
    .clipShape(.rect(cornerRadius: 20))
```

`Label` pairs text with an icon, and adapts to where it is shown:

```swift
Label("Favourites", systemImage: "star.fill")
```

## Modifier order matters

Each modifier wraps the view before it, so order changes the result:

```swift
Text("Hi").padding().background(.yellow)   // yellow around the padding
Text("Hi").background(.yellow).padding()   // yellow only behind the text
```

Try both in the canvas and you will see the difference.

# --instructions--

In your Hello project, replace `ContentView`'s body with a small "profile card": an SF Symbol or photo at the top, your name in a title style, and a line of caption text below. Experiment with modifier order until it looks right.

# --checklist--

- My card shows a symbol or photo, a title and a caption.
- I used text styles like `.title` and `.caption`, not fixed sizes.
- I swapped the order of `.padding()` and `.background()` and saw the difference.

# --questions--

## Why prefer `.font(.headline)` over `.font(.system(size: 17))`?
- [x] Text styles follow the reader's preferred text size
- [ ] It looks bolder
- [ ] Fixed sizes are not allowed
Why: Dynamic Type makes your app readable for everyone.

## What does `Image(systemName: "heart")` show?
- [ ] A photo from the Assets catalogue
- [x] The SF Symbol called heart
- [ ] An emoji
Why: `systemName:` picks an SF Symbol.

---
id: swiftui-layout
title: Stacks and layout
type: xcode
minutes: 18
---
# --description--

SwiftUI arranges views with **stacks**:

- `VStack` lines views up vertically,
- `HStack` horizontally,
- `ZStack` layers them on top of each other.

```swift
HStack(spacing: 12) {
    Image(systemName: "music.note")
        .font(.title)
    VStack(alignment: .leading) {
        Text("Freely Given")
            .font(.headline)
        Text("Mundus Novus")
            .font(.subheadline)
            .foregroundStyle(.secondary)
    }
    Spacer()
    Text("3:42")
        .monospacedDigit()
}
.padding()
```

`Spacer()` takes up all the spare room, pushing its neighbours apart. `alignment:` lines children up along the stack's edge, and `spacing:` sets the gap between them.

## How SwiftUI sizes things

Layout is a conversation:

1. A parent offers its child some space.
2. The child decides its own size: text takes what it needs, shapes and spacers take everything offered.
3. The parent places the child.

So `.frame(width: 200)` does not stretch a `Text`; it offers 200 points and centres the text inside. `.frame(maxWidth: .infinity)` asks for all the width available, which is how you make a full-width button.

## Adapting to space

Screens vary, and on iOS 27 iPhone apps can be **resized**, so your layout must cope with many sizes. A few tools help:

- `ViewThatFits` tries layouts in order and picks the first that fits.
- Prefer flexible frames (`maxWidth:`) over fixed numbers.
- `ScrollView` lets content longer than the screen scroll.
- Drag the resize handles on an iPhone preview in Xcode 27 to test.

```swift
ViewThatFits {
    HStack { controls }   // side by side if there is room
    VStack { controls }   // otherwise stacked
}
```

# --instructions--

Build a "now playing" row like the example, then put three of them in a `VStack` inside a `ScrollView`. Make the time line up on the right in every row, and check the layout at several sizes with the preview's resize handles.

# --checklist--

- I built a row with `HStack`, `VStack` and `Spacer`.
- Three rows sit in a `ScrollView`, and the times line up on the right.
- I resized the preview and the layout still worked.

# --questions--

## What does `Spacer()` do inside an `HStack`?
- [x] Takes up the spare horizontal room, pushing the views apart
- [ ] Adds a fixed 8-point gap
- [ ] Hides the views next to it
Why: Spacers expand to fill available space.

## How do you make a button fill the full width available?
- [ ] `.frame(width: 1000)`
- [x] `.frame(maxWidth: .infinity)`
- [ ] Put it in a `ZStack`
Why: A flexible frame asks for all the width offered.

---
id: swiftui-buttons
title: Buttons and Liquid Glass
type: xcode
minutes: 15
---
# --description--

A `Button` runs a closure when tapped, and shows a label:

```swift
Button("Save") {
    save()
}

Button {
    share()
} label: {
    Label("Share", systemImage: "square.and.arrow.up")
}
```

Buttons pick up the system's look automatically. Since iOS 26 and macOS 26, Apple's design language is **Liquid Glass**: controls float above your content on a translucent, light-bending material. Use the built-in styles and you get it for free:

```swift
Button("Get Started") { start() }
    .buttonStyle(.glassProminent)   // the main action

Button("Not Now") { dismiss() }
    .buttonStyle(.glass)            // a secondary action
```

You can give your own views the material too, with `.glassEffect()`:

```swift
Label("Offline", systemImage: "wifi.slash")
    .padding()
    .glassEffect()
```

Use glass for controls and navigation that float **above** content, not for the content itself: a whole screen of glass is hard to read. When several glass elements sit close together, put them in a `GlassEffectContainer` so they blend and morph into each other smoothly.

Give destructive buttons a role, and the system styles them appropriately:

```swift
Button("Delete", role: .destructive) { delete() }
```

> **Note** On iOS 27 and macOS 27, Liquid Glass picks up a system-wide tint slider automatically, and custom glass elements respond more fluidly to the Mac's pointer. You do not need to change any code.

# --instructions--

Add a pair of buttons to your profile card: a prominent glass **Follow** button and a plain glass **Message** button, side by side. Give the Follow button a `systemImage` with `Label`.

# --checklist--

- My card has a `.glassProminent` button and a `.glass` button.
- One button uses a `Label` with an SF Symbol.
- I tried the buttons in light and dark appearance.

# --questions--

## Where does Liquid Glass belong?
- [x] On controls and navigation floating above the content
- [ ] On every view, including large blocks of text
- [ ] Only on the Mac
Why: Glass separates controls from content; too much of it hurts readability.

## Which style marks the main action on a screen?
- [ ] `.glass`
- [x] `.glassProminent`
- [ ] `.plain`
Why: The prominent style draws the eye to the primary action.

---
id: swiftui-basics-quiz
title: "Quiz: SwiftUI views"
type: quiz
minutes: 4
---
# --description--

Four questions on SwiftUI views.

# --questions--

## What is `some View` in `var body: some View`?
- [x] A specific view type that the compiler works out, without you having to spell it
- [ ] Any view at all, decided while the app runs
- [ ] An optional view
Why: It is an opaque type: one concrete type, hidden behind the protocol.

## Which stack layers views on top of each other?
- [ ] `HStack`
- [ ] `VStack`
- [x] `ZStack`
Why: Z is depth: front to back.

## Why does the order of modifiers matter?
- [x] Each modifier wraps the view before it, so later ones apply to everything earlier
- [ ] It does not
- [ ] Only the last modifier counts
Why: `.padding().background()` and `.background().padding()` give different results.

## What is the canvas in Xcode?
- [ ] The app's background
- [x] Live previews of your views that update as you type
- [ ] The place where images are stored
Why: `#Preview` blocks appear there.
