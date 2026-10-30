---
id: enums-basics
title: Enumerations
type: lesson
minutes: 9
---
# --description--

An **enum**, short for enumeration, is a type with a fixed set of possible values, called **cases**:

```swift
enum Direction {
    case north, south, east, west
}

var heading = Direction.north
heading = .west   // Swift knows the type, so the name can be left off
```

Enums make impossible values impossible. A `heading` can only ever be one of four directions. Compare that with a `String`, where a typo like `"nrth"` would slip through.

`switch` and enums are made for each other. Because Swift knows every case, a `switch` that covers them all needs no `default`:

```swift
func turnRight(from d: Direction) -> Direction {
    switch d {
    case .north: .east
    case .east: .south
    case .south: .west
    case .west: .north
    }
}
```

And if you later add a case to the enum, Swift points at every `switch` that now needs updating. Leaving out `default` on purpose gets you that safety.

# --instructions--

1. Define an enum `TrafficLight` with the cases `red`, `amber` and `green`.
2. Write `next(_:)`, which takes a `TrafficLight` and returns the one that follows it: red → green → amber → red.
3. Use a `switch` with no `default`.

# --tests--

The light after `red` should be `green`, after `green` should be `amber`, and after `amber` should be `red`.

```swift
expect(next(.red) == .green && next(.green) == .amber && next(.amber) == .red)
```

You should switch over every case without `default`.

```source
switch[\s\S]*case\s+\.red[\s\S]*\}
```

```!source
default\s*:
```

# --seed--

```swift

```

# --solution--

```swift
enum TrafficLight {
    case red, amber, green
}

func next(_ light: TrafficLight) -> TrafficLight {
    switch light {
    case .red: .green
    case .green: .amber
    case .amber: .red
    }
}
```

---
id: enums-raw-values
title: Raw values and CaseIterable
type: lesson
minutes: 9
---
# --description--

Cases can carry a fixed **raw value** of one type, such as `String` or `Int`:

```swift
enum Planet: Int {
    case mercury = 1, venus, earth, mars   // venus is 2, earth 3, mars 4
}

enum Size: String {
    case small = "S", medium = "M", large = "L"
}

Planet.earth.rawValue   // 3
Size.large.rawValue     // "L"
```

For `String` raw values, a case with no explicit value uses its own name: `case tea` has the raw value `"tea"`.

You can go the other way with `init(rawValue:)`. Not every value matches a case, so it gives an optional:

```swift
Size(rawValue: "M")    // .medium
Size(rawValue: "XL")   // nil
```

Add `CaseIterable` and Swift gives you `allCases`, an array of every case in order. It is perfect for menus and pickers:

```swift
enum Drink: String, CaseIterable {
    case tea, coffee, juice
}

Drink.allCases.map(\.rawValue)   // ["tea", "coffee", "juice"]
```

`\.rawValue` is a **key path**: a short way to say "the `rawValue` property of each item".

# --instructions--

1. Define an enum `Weekday` with an `Int` raw value and `CaseIterable`, with cases `monday` through `sunday`, where `monday` is `1`.
2. Create `weekendNumbers`: the raw values of `saturday` and `sunday` in an array.
3. Create `fromNumber`: the weekday with raw value `3`, as an optional.
4. Create `count`: how many weekdays there are, from `allCases`.

# --tests--

`Weekday.monday.rawValue` should be `1` and `Weekday.sunday.rawValue` should be `7`.

```swift
expect(Weekday.monday.rawValue == 1 && Weekday.sunday.rawValue == 7)
```

`weekendNumbers` should be `[6, 7]`.

```swift
expect(weekendNumbers == [6, 7])
```

`fromNumber` should be `.wednesday`.

```swift
expect(fromNumber == .wednesday)
```

`count` should be `7`, from `allCases`.

```swift
expect(count == 7)
```

```source
allCases
```

# --seed--

```swift

```

# --solution--

```swift
enum Weekday: Int, CaseIterable {
    case monday = 1, tuesday, wednesday, thursday, friday, saturday, sunday
}

let weekendNumbers = [Weekday.saturday.rawValue, Weekday.sunday.rawValue]
let fromNumber = Weekday(rawValue: 3)
let count = Weekday.allCases.count
```

---
id: enums-associated
title: Associated values
type: lesson
minutes: 11
---
# --description--

Raw values are fixed. **Associated values** are different: each case can carry its own data, and each instance can carry different data.

```swift
enum Payment {
    case cash
    case card(last4: String)
    case voucher(code: String, amount: Double)
}

let a = Payment.cash
let b = Payment.card(last4: "4242")
let c = Payment.voucher(code: "WELCOME", amount: 10)
```

To get the data back out, match the case in a `switch` and bind the values with `let`:

```swift
func describe(_ p: Payment) -> String {
    switch p {
    case .cash:
        "Cash"
    case .card(let last4):
        "Card ending \(last4)"
    case .voucher(let code, let amount) where amount > 50:
        "Big voucher \(code)"
    case .voucher(let code, _):
        "Voucher \(code)"
    }
}
```

`_` ignores a value you do not need, and `where` adds a condition, as with numbers.

To check for one case only, use `if case`:

```swift
if case .card(let last4) = b {
    print(last4)
}
```

This is one of Swift's most powerful ideas. Together with `switch`, it lets you model "one of these, with exactly this data" precisely, and the compiler checks you handle every possibility.

# --instructions--

1. Define an enum `Shape` with three cases: `circle(radius: Double)`, `rectangle(width: Double, height: Double)` and `square(side: Double)`.
2. Write `area(of:)`, which returns the area as a `Double`. Use `Double.pi` for π.

# --tests--

The area of a `.rectangle(width: 3, height: 4)` should be `12`.

```swift
expect(area(of: .rectangle(width: 3, height: 4)) == 12)
```

The area of a `.square(side: 5)` should be `25`.

```swift
expect(area(of: .square(side: 5)) == 25)
```

The area of a `.circle(radius: 1)` should be π.

```swift
expect(abs(area(of: .circle(radius: 1)) - Double.pi) < 0.0001)
```

# --seed--

```swift

```

# --solution--

```swift
enum Shape {
    case circle(radius: Double)
    case rectangle(width: Double, height: Double)
    case square(side: Double)
}

func area(of shape: Shape) -> Double {
    switch shape {
    case .circle(let r): Double.pi * r * r
    case .rectangle(let w, let h): w * h
    case .square(let s): s * s
    }
}
```

---
id: enums-state
title: Modelling state with enums
type: lesson
minutes: 11
---
# --description--

Enums can have methods and computed properties, just like structs. This makes them ideal for modelling **state**: the situation something is in, with the data that belongs to each situation.

Think about loading something from the internet. It is idle, or loading, or finished with data, or failed with an error message. Here is a version with separate properties:

```swift
var isLoading = false
var data: [String]? = nil
var errorMessage: String? = nil
```

Nothing stops `isLoading` being `true` while `errorMessage` is set, which makes no sense. As an enum, impossible combinations cannot exist:

```swift
enum LoadState {
    case idle
    case loading
    case loaded([String])
    case failed(String)

    var isFinished: Bool {
        switch self {
        case .loaded, .failed: true
        case .idle, .loading: false
        }
    }
}
```

A method that changes `self` on an enum is `mutating`, as on a struct:

```swift
extension LoadState {
    mutating func reset() { self = .idle }
}
```

You will use exactly this pattern to drive screens in SwiftUI.

# --instructions--

Define an enum `Order` that models a delivery: `placed`, `shipped(trackingNumber: String)`, `delivered(day: String)`, and `cancelled`.

Give it:

1. A computed property `summary: String`:
   - `placed`: `"Order placed"`
   - `shipped`: `"Shipped, tracking <number>"`
   - `delivered`: `"Delivered on <day>"`
   - `cancelled`: `"Cancelled"`
2. A computed property `canCancel: Bool`, `true` only while the order is placed.
3. A `mutating func ship(trackingNumber: String)` that changes a placed order to shipped and leaves any other state alone.

# --tests--

`summary` should describe each state.

```swift
expect(Order.placed.summary == "Order placed")
expect(Order.shipped(trackingNumber: "Z9").summary == "Shipped, tracking Z9")
expect(Order.delivered(day: "Friday").summary == "Delivered on Friday")
expect(Order.cancelled.summary == "Cancelled")
```

Only a placed order can be cancelled.

```swift
expect(Order.placed.canCancel && !Order.shipped(trackingNumber: "A").canCancel && !Order.cancelled.canCancel)
```

`ship` should move a placed order to shipped.

```swift
var o = Order.placed
o.ship(trackingNumber: "TR1")
expect(o.summary == "Shipped, tracking TR1")
```

`ship` should leave a delivered order alone.

```swift
var o = Order.delivered(day: "Monday")
o.ship(trackingNumber: "TR2")
expect(o.summary == "Delivered on Monday")
```

# --seed--

```swift

```

# --solution--

```swift
enum Order {
    case placed
    case shipped(trackingNumber: String)
    case delivered(day: String)
    case cancelled

    var summary: String {
        switch self {
        case .placed: "Order placed"
        case .shipped(let number): "Shipped, tracking \(number)"
        case .delivered(let day): "Delivered on \(day)"
        case .cancelled: "Cancelled"
        }
    }

    var canCancel: Bool {
        if case .placed = self { return true }
        return false
    }

    mutating func ship(trackingNumber: String) {
        guard case .placed = self else { return }
        self = .shipped(trackingNumber: trackingNumber)
    }
}
```

---
id: enums-quiz
title: "Quiz: enums"
type: quiz
minutes: 4
---
# --description--

Five questions on enums.

# --questions--

## Why can a `switch` over an enum often leave out `default`?
- [x] Swift knows every case, so it can check they are all handled
- [ ] Enums cannot be switched on with `default`
- [ ] The last case acts as a default
Why: Covering every case makes the switch exhaustive, and Swift will tell you when a new case needs handling.

## What does `Size(rawValue: "XL")` give if there is no such case?
- [ ] A crash
- [x] `nil`
- [ ] The first case
Why: Not every raw value matches a case, so this initializer returns an optional.

## What is the difference between raw values and associated values?
- [x] Raw values are fixed per case; associated values can differ for every instance
- [ ] They are the same thing
- [ ] Associated values must be strings
Why: `.card(last4: "4242")` carries data chosen when the value is made.

## What does `CaseIterable` add to an enum?
- [ ] Raw values
- [x] `allCases`, an array of every case
- [ ] Associated values
Why: It is perfect for menus and pickers.

## Why model a screen's loading state as an enum rather than several separate properties?
- [ ] It is shorter to type
- [x] Impossible combinations, like loading and failed at once, cannot exist
- [ ] Enums are faster
Why: Each case carries exactly the data that belongs to it, and nothing else.
