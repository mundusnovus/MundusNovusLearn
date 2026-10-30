---
id: design-system
title: Colour, type and the system look
type: xcode
minutes: 15
---
# --description--

Apps feel at home when they use the system's building blocks. Three habits get you most of the way.

**Use semantic colours.** `.primary`, `.secondary`, `Color(.systemBackground)` on iOS, and `.tint` adapt to light mode, dark mode and increased contrast automatically. Set your app's accent colour once, in the **Assets** catalogue's `AccentColor`, and controls pick it up everywhere. Define your own colours in the Assets catalogue too, with a light and a dark variant each, and use them by name: `Color("Parchment")`.

**Use text styles.** `.font(.title2)`, `.font(.body)` and friends follow Dynamic Type. To change the family but keep the scaling, use `.font(.system(.title, design: .serif))` or `.fontDesign(.rounded)`.

**Use materials and glass for layers.** Backgrounds behind floating controls should be `.background(.regularMaterial)` or Liquid Glass, so content shows through softly and stays readable.

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("Streak")
        .font(.caption)
        .foregroundStyle(.secondary)
    Text("12 days")
        .font(.system(.largeTitle, design: .rounded, weight: .bold))
}
.padding()
.background(.regularMaterial, in: .rect(cornerRadius: 16))
```

In Device Hub's inspector, try dark appearance, increased contrast and the largest text sizes against every screen you build. If something breaks, it is usually a fixed colour or a fixed size.

# --checklist--

- My app sets an accent colour in the Assets catalogue.
- I use semantic colours and text styles, not fixed ones.
- I checked my screens in dark mode, increased contrast and the largest text size.

# --questions--

## Why prefer `.secondary` over a specific grey?
- [x] It adapts to light mode, dark mode and increased contrast
- [ ] It is a nicer grey
- [ ] Specific colours are not allowed
Why: Semantic colours keep text readable in every setting.

---
id: design-accessibility
title: Accessibility
type: xcode
minutes: 18
---
# --description--

More than a billion people live with some form of disability. Apple's platforms have the world's best built-in accessibility features, and SwiftUI gives you most of the support for free. Your job is to fill the gaps.

**VoiceOver** reads the screen aloud. Turn it on with **Settings › Accessibility › VoiceOver**, or triple-click the side button once you set the shortcut, and try your app with your eyes closed. Common fixes:

```swift
// an image that only decorates: hide it from VoiceOver
Image("swirl").accessibilityHidden(true)

// an icon-only button: give it a spoken label
Button { toggleFavourite() } label: {
    Image(systemName: isFavourite ? "star.fill" : "star")
}
.accessibilityLabel(isFavourite ? "Remove from favourites" : "Add to favourites")

// several views that belong together: read them as one
HStack {
    Text(habit.name)
    Text("\(habit.streak) days")
}
.accessibilityElement(children: .combine)
```

Other things to check:

- **Dynamic Type**: at the largest sizes, does text wrap instead of cutting off? Rows may need to switch from `HStack` to `VStack`: `@Environment(\.dynamicTypeSize)` tells you the size.
- **Colour**: never use colour alone to carry meaning. Pair red and green with an icon or a word.
- **Motion**: some people get dizzy from movement. `@Environment(\.accessibilityReduceMotion)` tells you to tone animations down.
- **Touch targets**: make tappable things at least 44 by 44 points.

Xcode's **Accessibility Inspector** (Xcode › Open Developer Tool) can audit a running app and list problems. You will also run an automated audit from a UI test in the Quality chapter.

# --checklist--

- I used my app with VoiceOver on, and every control is announced clearly.
- Decorative images are hidden, and icon-only buttons have labels.
- My layout works at the largest accessibility text size.
- Nothing relies on colour alone.

# --questions--

## An icon-only button reads as "star" in VoiceOver. What is the fix?
- [x] `.accessibilityLabel("Add to favourites")`
- [ ] Make the icon bigger
- [ ] Hide the button from VoiceOver
Why: The label should say what the button does.

## How should a red "overdue" state be shown?
- [ ] In red only
- [x] In red, plus an icon or the word "Overdue"
- [ ] With a sound
Why: Colour alone fails people who cannot see the difference.

---
id: design-motion
title: Animation
type: xcode
minutes: 15
---
# --description--

Good animation explains what changed. SwiftUI animates changes in state, and there are two ways to ask for it.

Wrap a state change in `withAnimation` to animate everything it affects:

```swift
Button("Complete") {
    withAnimation(.spring) {
        habit.isDone.toggle()
    }
}
```

Or attach `.animation(_:value:)` to a view, to animate it whenever one value changes:

```swift
Circle()
    .fill(isDone ? .green : .gray)
    .scaleEffect(isDone ? 1.2 : 1)
    .animation(.bouncy, value: isDone)
```

Views that appear and disappear can choose a **transition**:

```swift
if showBanner {
    BannerView()
        .transition(.move(edge: .top).combined(with: .opacity))
}
```

Some more tools to know: `.contentTransition(.numericText())` for changing numbers, `.symbolEffect(.bounce, value:)` for SF Symbols, and `matchedGeometryEffect` to make one view seem to fly into another.

Keep animations quick (a fraction of a second), purposeful, and respectful of **Reduce Motion**:

```swift
@Environment(\.accessibilityReduceMotion) private var reduceMotion
withAnimation(reduceMotion ? nil : .spring) { ... }
```

# --checklist--

- Completing a habit animates with a spring.
- A banner slides in and fades out with a transition.
- With Reduce Motion on, the animations are toned down.

# --questions--

## What does `.animation(.bouncy, value: isDone)` animate?
- [x] Changes to the view whenever `isDone` changes
- [ ] Every change in the app
- [ ] Nothing until you call a method
Why: It ties the animation to one value.

---
id: design-quiz
title: "Quiz: design"
type: quiz
minutes: 3
---
# --description--

Three questions on design, accessibility and motion.

# --questions--

## Your text is cut off at large text sizes. What is the likely cause?
- [x] A fixed frame or font size, or an `HStack` that should become a `VStack`
- [ ] Dynamic Type is broken
- [ ] The text is too long
Why: Let text wrap and layouts adapt.

## What should you do when Reduce Motion is on?
- [ ] Nothing
- [x] Replace large movements with fades, or remove the animation
- [ ] Turn off the app's interface
Why: Movement can make some people feel unwell.

## What is the minimum comfortable size for a touch target?
- [ ] 20 by 20 points
- [x] 44 by 44 points
- [ ] 100 by 100 points
Why: That is Apple's guideline for reliable tapping.
