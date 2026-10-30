---
id: protocols-intro
title: Protocols
type: lesson
minutes: 10
---
# --description--

A **protocol** describes what a type can do, without saying how. It is a list of requirements: properties and methods a type must have.

```swift
protocol Describable {
    var name: String { get }
    func describe() -> String
}
```

`{ get }` means the property must be readable. A type **conforms** to the protocol by saying so after its name, and providing everything it asks for:

```swift
struct Dog: Describable {
    let name: String
    func describe() -> String { "\(name) the dog" }
}

struct City: Describable {
    let name: String
    let population: Int
    func describe() -> String { "\(name), population \(population)" }
}
```

Now you can write code that works with **anything** describable, without caring what it is:

```swift
func introduce(_ thing: some Describable) {
    print(thing.describe())
}

introduce(Dog(name: "Rex"))
introduce(City(name: "Lima", population: 10_000_000))
```

Protocols are at the heart of Swift. Apple calls Swift a **protocol-oriented** language: instead of building deep class hierarchies, you describe abilities with protocols and give them to any type, struct, enum or class.

# --instructions--

1. Define a protocol `Priced` that requires a readable `price: Double`.
2. Make `Book` and `Coffee` conform to it. `Book` already has a `price`; `Coffee` should work out its price as `2.5` for a small and `3.5` for a large, using a computed property.
3. Write `totalCost(_:)`, which takes an array of `any Priced` and returns the total price.

# --tests--

`Book` and `Coffee` should both be `Priced`.

```swift
let items: [any Priced] = [Book(title: "Dune", price: 12), Coffee(isLarge: true)]
expect(items.count == 2)
```

A large coffee should cost `3.5`, and a small one `2.5`.

```swift
expect(Coffee(isLarge: true).price == 3.5 && Coffee(isLarge: false).price == 2.5)
```

`totalCost` should add up mixed items.

```swift
let items: [any Priced] = [Book(title: "Dune", price: 12), Coffee(isLarge: false), Coffee(isLarge: true)]
expect(totalCost(items) == 18)
```

`Priced` should be a protocol with a `price` requirement.

```source
protocol\s+Priced\s*\{[\s\S]*var\s+price\s*:\s*Double\s*\{\s*get\s*\}
```

# --seed--

```swift
struct Book {
    let title: String
    let price: Double
}

struct Coffee {
    let isLarge: Bool
}

```

# --solution--

```swift
protocol Priced {
    var price: Double { get }
}

struct Book: Priced {
    let title: String
    let price: Double
}

struct Coffee: Priced {
    let isLarge: Bool
    var price: Double { isLarge ? 3.5 : 2.5 }
}

func totalCost(_ items: [any Priced]) -> Double {
    items.reduce(0) { $0 + $1.price }
}
```

---
id: protocols-standard
title: Equatable, Hashable and Comparable
type: lesson
minutes: 11
---
# --description--

Swift's standard library is built from protocols, and your types can join in. Four you will use constantly:

| Protocol | What it gives you |
| --- | --- |
| `Equatable` | `==` and `!=` |
| `Hashable` | Use as a dictionary key or in a set |
| `Comparable` | `<`, `>`, and `sorted()`, `min()`, `max()` |
| `CustomStringConvertible` | Control how `print` shows your type |

For `Equatable` and `Hashable`, you usually just write the name. If all the properties are themselves equatable or hashable, Swift writes the code for you:

```swift
struct Point: Hashable {
    var x: Int
    var y: Int
}

Point(x: 1, y: 2) == Point(x: 1, y: 2)   // true
let visited: Set<Point> = [Point(x: 0, y: 0)]
```

`Comparable` needs you to say what "less than" means, with a `static func <`:

```swift
struct Version: Comparable {
    let major: Int, minor: Int

    static func < (a: Version, b: Version) -> Bool {
        (a.major, a.minor) < (b.major, b.minor)   // tuples compare item by item
    }
}

[Version(major: 2, minor: 0), Version(major: 1, minor: 9)].max()   // 2.0
```

`CustomStringConvertible` asks for a `description`:

```swift
extension Version: CustomStringConvertible {
    var description: String { "\(major).\(minor)" }
}
print(Version(major: 1, minor: 2))   // 1.2
```

# --instructions--

Make `Card` conform to `Hashable`, `Comparable` and `CustomStringConvertible`:

- Cards compare by `rank` (a higher rank is greater).
- `description` is like `"7♠"`: the rank followed by the suit.

Then create `hand`: the cards in `dealt` with duplicates removed (using a `Set`) and sorted from lowest to highest.

# --tests--

Two cards with the same rank and suit should be equal.

```swift
expect(Card(rank: 7, suit: "♠") == Card(rank: 7, suit: "♠"))
```

A lower rank should be less than a higher one.

```swift
expect(Card(rank: 2, suit: "♥") < Card(rank: 9, suit: "♣"))
```

`description` should be the rank then the suit.

```swift
expect(Card(rank: 10, suit: "♦").description == "10♦")
```

`hand` should be the unique cards, lowest first.

```swift
expect(hand.map(\.description) == ["3♣", "7♠", "12♥"])
```

# --seed--

```swift
struct Card {
    let rank: Int
    let suit: String
}

let dealt = [Card(rank: 7, suit: "♠"), Card(rank: 12, suit: "♥"), Card(rank: 3, suit: "♣"), Card(rank: 7, suit: "♠")]

```

# --solution--

```swift
struct Card: Hashable, Comparable, CustomStringConvertible {
    let rank: Int
    let suit: String

    static func < (a: Card, b: Card) -> Bool { a.rank < b.rank }

    var description: String { "\(rank)\(suit)" }
}

let dealt = [Card(rank: 7, suit: "♠"), Card(rank: 12, suit: "♥"), Card(rank: 3, suit: "♣"), Card(rank: 7, suit: "♠")]
let hand = Set(dealt).sorted()
```

---
id: protocols-extensions
title: Extensions
type: lesson
minutes: 10
---
# --description--

An **extension** adds new abilities to a type that already exists, even one you did not write, like `Int` or `String`:

```swift
extension Int {
    var isEven: Bool { self % 2 == 0 }

    func times(_ action: () -> Void) {
        for _ in 0..<self { action() }
    }
}

4.isEven            // true
3.times { print("Hi") }
```

Extensions can add computed properties, methods, initializers and protocol conformances. They cannot add stored properties.

They are also how Swift programmers **organise** code. A common style puts each protocol conformance in its own extension:

```swift
struct Track {
    let title: String
    let seconds: Int
}

extension Track: CustomStringConvertible {
    var description: String { "\(title) (\(seconds / 60):\(String(format: "%02d", seconds % 60)))" }
}
```

And, as you saw in Structs, an `init` written in an extension keeps the free memberwise initializer.

# --instructions--

1. Extend `String` with a computed property `isPalindrome`: `true` when the text reads the same backwards, ignoring capital letters. `"Level"` is a palindrome. Use `lowercased()` and `reversed()`.
2. Extend `Array` where the elements are `Int` with a computed property `average: Double` (`0` for an empty array). Write the extension as `extension Array where Element == Int`.

# --tests--

`"Level".isPalindrome` should be `true` and `"Swift".isPalindrome` should be `false`.

```swift
expect("Level".isPalindrome && !"Swift".isPalindrome)
```

`[2, 4, 9].average` should be `5.0`, and an empty array's average `0`.

```swift
expect([2, 4, 9].average == 5.0 && [Int]().average == 0)
```

You should use extensions.

```source
extension\s+String[\s\S]*extension\s+Array\s+where\s+Element\s*==\s*Int|extension\s+Array\s+where\s+Element\s*==\s*Int[\s\S]*extension\s+String
```

# --seed--

```swift

```

# --solution--

```swift
extension String {
    var isPalindrome: Bool {
        let lower = lowercased()
        return lower == String(lower.reversed())
    }
}

extension Array where Element == Int {
    var average: Double {
        isEmpty ? 0 : Double(reduce(0, +)) / Double(count)
    }
}
```

---
id: protocols-defaults
title: Protocol extensions
type: lesson
minutes: 10
---
# --description--

You can extend a **protocol**, too. Anything you add becomes available to every conforming type, for free. This is how a protocol can provide **default behaviour**:

```swift
protocol Greeter {
    var name: String { get }
}

extension Greeter {
    func greet() -> String { "Hello from \(name)!" }
}

struct Robot: Greeter { let name: String }
Robot(name: "R2").greet()   // "Hello from R2!"
```

`Robot` wrote nothing but `name`, yet it can `greet()`.

If a protocol **requirement** has a default in an extension, a type can still provide its own version to replace it:

```swift
protocol Animal {
    var name: String { get }
    func sound() -> String
}

extension Animal {
    func sound() -> String { "..." }
}

struct Cat: Animal {
    let name: String
    func sound() -> String { "Meow" }   // replaces the default
}
struct Fish: Animal { let name: String }   // uses the default
```

This is the protocol-oriented way to share behaviour: no superclass needed, and it works for structs and enums, not only classes. Much of Swift's own library, such as `map` and `filter` on every collection, comes from protocol extensions.

# --instructions--

1. Define a protocol `Shape` that requires `func area() -> Double` and a readable `name: String`.
2. In a protocol extension, give every `Shape` a method `summary() -> String` that returns `"<name> with area <area>"`, and a default `name` of `"Shape"`.
3. Make `Square` (with a `side`) and `Circle` (with a `radius`) conform. `Circle` should use the default name; `Square` should have the name `"Square"`. Use `3.0` in place of π to keep the numbers simple.

# --tests--

`Square(side: 2).summary()` should be `"Square with area 4.0"`.

```swift
expect(Square(side: 2).summary() == "Square with area 4.0")
```

`Circle(radius: 1).summary()` should use the default name: `"Shape with area 3.0"`.

```swift
expect(Circle(radius: 1).summary() == "Shape with area 3.0")
```

`summary` and the default `name` should come from a protocol extension.

```source
extension\s+Shape\s*\{[\s\S]*func\s+summary[\s\S]*\}|extension\s+Shape\s*\{[\s\S]*var\s+name
```

# --seed--

```swift

```

# --solution--

```swift
protocol Shape {
    var name: String { get }
    func area() -> Double
}

extension Shape {
    var name: String { "Shape" }

    func summary() -> String {
        "\(name) with area \(area())"
    }
}

struct Square: Shape {
    let side: Double
    var name: String { "Square" }
    func area() -> Double { side * side }
}

struct Circle: Shape {
    let radius: Double
    func area() -> Double { 3.0 * radius * radius }
}
```

---
id: protocols-some-any
title: some and any
type: lesson
minutes: 11
---
# --description--

When a protocol is used as a type, Swift asks you to say which of two things you mean.

**`some Protocol`** means "one particular type that conforms, which the compiler knows". It is fast and keeps full type information:

```swift
func makeGreeter() -> some Greeter {
    Robot(name: "R2")   // always a Robot, though callers only see "some Greeter"
}

func introduce(_ g: some Greeter) { print(g.greet()) }
```

**`any Protocol`** means "a box that can hold any conforming type, decided while the program runs". You need it when the actual type can vary, such as an array holding different kinds of things:

```swift
let crowd: [any Greeter] = [Robot(name: "R2"), Person(name: "Ana")]
```

The box has a small cost, and some protocols, those with `Self` or associated-type requirements like `Equatable`, have limits on what you can do through it.

The rule of thumb: **write `some` by default; switch to `any` when the type really must vary.** You will see `some` everywhere in SwiftUI, where every view's body is `some View`: a specific view type, built by the compiler, that you never have to spell out.

# --instructions--

1. Write `loudest(_:)`, which takes an `[any Animal]` and returns the `name` of the animal whose `sound()` is longest, or `"Nobody"` for an empty array.
2. Write `echo(_:)`, which takes `some Animal` and returns its sound twice, separated by a space.

`Animal`, `Dog` and `Bird` are written for you.

# --tests--

`loudest` should find the longest sound in a mixed array.

```swift
expect(loudest([Dog(name: "Rex"), Bird(name: "Tweety")]) == "Tweety")
```

`loudest([])` should be `"Nobody"`.

```swift
expect(loudest([]) == "Nobody")
```

`echo(Dog(name: "Rex"))` should be `"Woof Woof"`.

```swift
expect(echo(Dog(name: "Rex")) == "Woof Woof")
```

You should use `any Animal` and `some Animal`.

```source
any\s+Animal[\s\S]*some\s+Animal|some\s+Animal[\s\S]*any\s+Animal
```

# --seed--

```swift
protocol Animal {
    var name: String { get }
    func sound() -> String
}

struct Dog: Animal {
    let name: String
    func sound() -> String { "Woof" }
}

struct Bird: Animal {
    let name: String
    func sound() -> String { "Tweet tweet" }
}

```

# --solution--

```swift
protocol Animal {
    var name: String { get }
    func sound() -> String
}

struct Dog: Animal {
    let name: String
    func sound() -> String { "Woof" }
}

struct Bird: Animal {
    let name: String
    func sound() -> String { "Tweet tweet" }
}

func loudest(_ animals: [any Animal]) -> String {
    animals.max { $0.sound().count < $1.sound().count }?.name ?? "Nobody"
}

func echo(_ animal: some Animal) -> String {
    animal.sound() + " " + animal.sound()
}
```

---
id: protocols-lab-media
title: "Lab: a media library"
type: lab
minutes: 18
---
# --description--

Design a small media library that holds books, films and albums, all described by one protocol.

# --instructions--

1. A protocol `Media` requiring `title: String`, `year: Int` and `minutes: Int` (how long it takes to read, watch or listen).
2. A protocol extension giving every `Media` a `label: String` of `"<title> (<year>)"`.
3. Three structs conforming to `Media`: `Book` (with `pages`; reading time is 2 minutes a page), `Film` (with `minutes` stored directly) and `Album` (with `tracks: [Int]`, each track's length in minutes; its minutes are the sum).
4. A function `planWeekend(_ items: [any Media], hours: Int) -> [String]` that picks items in the given order, skipping any that would go over the time available, and returns their labels.

# --tests--

A book's minutes should be twice its pages.

```swift
expect(Book(title: "Dune", year: 1965, pages: 400).minutes == 800)
```

An album's minutes should be the sum of its tracks.

```swift
expect(Album(title: "Freely Given", year: 2026, tracks: [3, 4, 5]).minutes == 12)
```

`label` should come from the protocol extension.

```swift
expect(Film(title: "Arrival", year: 2016, minutes: 116).label == "Arrival (2016)")
```

```source
extension\s+Media
```

`planWeekend` should skip items that do not fit, in order.

```swift
let items: [any Media] = [Film(title: "A", year: 2000, minutes: 120), Book(title: "B", year: 2001, pages: 300), Album(title: "C", year: 2002, tracks: [30, 30])]
expect(planWeekend(items, hours: 4) == ["A (2000)", "C (2002)"])
```

# --seed--

```swift

```

# --solution--

```swift
protocol Media {
    var title: String { get }
    var year: Int { get }
    var minutes: Int { get }
}

extension Media {
    var label: String { "\(title) (\(year))" }
}

struct Book: Media {
    let title: String
    let year: Int
    let pages: Int
    var minutes: Int { pages * 2 }
}

struct Film: Media {
    let title: String
    let year: Int
    let minutes: Int
}

struct Album: Media {
    let title: String
    let year: Int
    let tracks: [Int]
    var minutes: Int { tracks.reduce(0, +) }
}

func planWeekend(_ items: [any Media], hours: Int) -> [String] {
    var left = hours * 60
    var plan: [String] = []
    for item in items where item.minutes <= left {
        left -= item.minutes
        plan.append(item.label)
    }
    return plan
}
```

---
id: protocols-quiz
title: "Quiz: protocols"
type: quiz
minutes: 4
---
# --description--

Five questions on protocols and extensions.

# --questions--

## What does a protocol define?
- [x] Requirements: what a conforming type must provide
- [ ] A type that can be created with an initializer
- [ ] A way to copy a struct
Why: A protocol says what, not how; conforming types supply the how.

## How do you get `==` for a struct whose properties are all `Equatable`?
- [ ] Write `static func ==` yourself
- [x] Write `: Equatable` after its name
- [ ] It already has it
Why: Swift writes the code for you when every property is equatable.

## What can an extension not add to a type?
- [ ] Methods
- [ ] Computed properties
- [x] Stored properties
Why: Extensions can add behaviour, not storage.

## Where does a protocol's default behaviour come from?
- [ ] A superclass
- [x] A protocol extension
- [ ] The first type that conforms
Why: Methods in a protocol extension are available to every conforming type.

## When must you write `any` instead of `some`?
- [ ] Always
- [x] When values of different conforming types are mixed, such as in one array
- [ ] When the protocol has methods
Why: `some` is one specific type; `any` is a box that can hold different types.
