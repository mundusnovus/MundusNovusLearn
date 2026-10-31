---
id: swift64-memberwise
title: Smarter memberwise initializers
type: lesson
minutes: 7
---
# --description--

Swift 6.4 arrived in September 2026 with Xcode 27. This module covers the changes you are most likely to use. Everything you have learned so far already uses Swift 6.4.

The first is small but saves a lot of typing. A struct's free memberwise initializer has a parameter for each stored property. Before Swift 6.4, a single `private` property, even one with a default value, made the whole initializer `private`, so nobody outside the struct could use it.

Now, `private` stored properties **with a default value** are simply left out of the memberwise initializer, and it stays usable:

```swift
struct Download {
    var url: String
    var name: String
    private var attempts = 0      // left out of the initializer

    mutating func retry() { attempts += 1 }
    var hasRetried: Bool { attempts > 0 }
}

let d = Download(url: "https://asteria.technology/a.zip", name: "a.zip")   // works in Swift 6.4
```

This makes it easy to keep bookkeeping details private without writing an initializer by hand.

# --instructions--

Write a struct `Player` with:

- `name` (`String`),
- `team` (`String`),
- a `private var points = 0`,
- a `mutating func score(_ amount: Int)` that adds to `points`,
- a computed `total: Int` that returns `points`.

Create a variable `ana` with the memberwise initializer, `Player(name: "Ana", team: "Blue")`, and score `3` then `2`.

# --tests--

`ana.total` should be `5`.

```swift
expect(ana.total == 5)
```

`points` should be private with a default value.

```source
private\s+var\s+points\s*=\s*0
```

You should use the memberwise initializer, not write an `init`.

```!source
\binit\s*\(
```

# --seed--

```swift

```

# --solution--

```swift
struct Player {
    var name: String
    var team: String
    private var points = 0

    mutating func score(_ amount: Int) {
        points += amount
    }

    var total: Int { points }
}

var ana = Player(name: "Ana", team: "Blue")
ana.score(3)
ana.score(2)
```

---
id: swift64-async-defer
title: await in defer, and weak let
type: lesson
minutes: 9
---
# --description--

## await inside defer

`defer` runs clean-up when a scope ends. Until Swift 6.4, that clean-up could not be async, which was awkward when closing a connection or saving a file meant waiting. Now a `defer` in an async function can `await`:

```swift
func syncNotes() async throws {
    let connection = await Server.connect()
    defer { await connection.close() }   // runs however the function ends
    try await connection.upload(notes)
}
```

## weak let

A `weak` reference used to have to be a `var`, because Swift sets it to `nil` when its object goes away. That made a class containing one hard to mark `Sendable`. Swift 6.4 allows `weak let`: a weak reference you cannot reassign yourself, which Swift can still clear. A `final class` with only `let` properties, including `weak let`, can be `Sendable`:

```swift
final class Child: Sendable {
    weak let parent: Parent?
    init(parent: Parent?) { self.parent = parent }
}
```

# --instructions--

1. Write `process(_ items: [String]) async -> Int` that prints `opening`, uses `defer` to `await` a call to `close()` (written for you), then prints each item and returns how many there were.
2. Write a `final class Leaf: Sendable` with a `weak let tree: Tree?` and an initializer.

# --tests--

`process` should open, print the items, and close last.

```swift
let n = await process(["a", "b"])
expect(n == 2)
```

```output
^opening\na\nb\nclosed$
```

`process` should `await` inside `defer`.

```source
defer\s*\{\s*await
```

`Leaf` should hold its tree with `weak let`, and be `Sendable`.

```source
final\s+class\s+Leaf\s*:\s*Sendable[\s\S]*weak\s+let\s+tree
```

```swift
let tree = Tree()
let leaf = Leaf(tree: tree)
expect(leaf.tree === tree)
```

# --seed--

```swift
final class Tree: Sendable {}

func close() async {
    print("closed")
}

```

# --solution--

```swift
final class Tree: Sendable {}

func close() async {
    print("closed")
}

func process(_ items: [String]) async -> Int {
    print("opening")
    defer { await close() }
    for item in items {
        print(item)
    }
    return items.count
}

final class Leaf: Sendable {
    weak let tree: Tree?

    init(tree: Tree?) {
        self.tree = tree
    }
}
```

---
id: swift64-availability
title: anyAppleOS and @diagnose
type: lesson
minutes: 9
---
# --description--

## anyAppleOS

Apple's platforms now share one version number: iOS 27, iPadOS 27, macOS 27, watchOS 27, tvOS 27 and visionOS 27. Swift 6.4 lets you say "this needs the 2026 releases or later, on any Apple platform" in one go:

```swift
@available(anyAppleOS 27, *)
func useNewFeature() { ... }

if #available(anyAppleOS 27, *) {
    useNewFeature()
} else {
    useOlderWay()
}
```

Before, you had to list every platform: `@available(iOS 27, macOS 27, watchOS 27, tvOS 27, visionOS 27, *)`.

## @diagnose

Sometimes you knowingly use something deprecated while you move away from it, and the warnings drown out the ones that matter. Swift 6.4's `@diagnose` changes how a single declaration's warnings are reported, without affecting the rest of your code:

```swift
@diagnose(DeprecatedDeclaration, as: ignored, reason: "Moving to the new API in 2.1")
func legacyLogin() { oldLogin() }
```

The `reason` is required: it reminds the next person (often you) why the rule was bent.

# --instructions--

1. Write `badge() -> String`, available on `anyAppleOS 27`, that returns `"✨ New"`.
2. Write `label() -> String` that returns `badge()` when it is available and `"New"` otherwise, using `#available(anyAppleOS 27, *)`.
3. The deprecated `oldTotal()` is written for you. Write `total() -> Int` that calls it, marked with `@diagnose(DeprecatedDeclaration, as: ignored, reason: ...)`.

# --tests--

`label()` should be `"✨ New"`, because the exercises run on the 2026 releases.

```swift
expect(label() == "✨ New")
```

You should use `anyAppleOS` for both the attribute and the check.

```source
@available\s*\(\s*anyAppleOS\s+27[\s\S]*#available\s*\(\s*anyAppleOS\s+27
```

`total()` should return `10` with `@diagnose`.

```swift
expect(total() == 10)
```

```source
@diagnose\s*\(\s*DeprecatedDeclaration\s*,\s*as:\s*ignored\s*,\s*reason:
```

# --seed--

```swift
@available(*, deprecated, message: "Use the new totals API")
func oldTotal() -> Int { 10 }

```

# --solution--

```swift
@available(*, deprecated, message: "Use the new totals API")
func oldTotal() -> Int { 10 }

@available(anyAppleOS 27, *)
func badge() -> String { "✨ New" }

func label() -> String {
    if #available(anyAppleOS 27, *) {
        return badge()
    }
    return "New"
}

@diagnose(DeprecatedDeclaration, as: ignored, reason: "Moving to the new totals API")
func total() -> Int { oldTotal() }
```

---
id: swift64-quiz
title: "Quiz: the Swift language"
type: quiz
minutes: 8
---
# --description--

You have finished the Swift language half of the course. This review mixes questions from every module. If one stumps you, revisit that module before moving on to Xcode.

# --questions--

## Which is the best way to give back "no result" from a function that searches a list?
- [x] Return an optional and `nil` when nothing is found
- [ ] Return `-1`
- [ ] Crash with `fatalError`
Why: Optionals say clearly that there may be no value, and Swift makes callers handle it.

## You change a property on a copy of a value. When does the original change too?
- [ ] When it is a struct
- [x] When it is a class
- [ ] Never
Why: Classes are references; structs are values.

## What does this print?

```swift
let words = ["swift", "is", "fun"]
print(words.filter { $0.count > 2 }.map { $0.uppercased() })
```
- [x] `["SWIFT", "FUN"]`
- [ ] `["SWIFT", "IS", "FUN"]`
- [ ] `["swift", "fun"]`
Why: `filter` keeps the longer words, then `map` uppercases them.

## Which keeps state safe when many tasks change it at once?
- [ ] A struct
- [ ] A global variable
- [x] An actor
Why: Only one task can be inside an actor at a time.

## In Swift 6.4, what happens to a `private var count = 0` in a struct's memberwise initializer?
- [ ] It makes the initializer private
- [x] It is left out, and the initializer stays usable
- [ ] It becomes a required parameter
Why: That is Swift 6.4's smarter memberwise initializer.

## Which type best models "a payment by cash, card (with its last four digits) or voucher (with a code)"?
- [ ] A struct with three optional properties
- [x] An enum with associated values
- [ ] A class hierarchy
Why: Each case carries exactly its own data, and switches must handle all three.
