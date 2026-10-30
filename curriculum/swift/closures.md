---
id: closures-basics
title: Functions as values
type: lesson
minutes: 9
---
# --description--

In Swift, functions are values. You can store one in a constant, pass it to another function, or return it, like a number or a string.

A **closure** is a function written without a name, right where you need it. It goes in braces, with its parameters and return type before the word `in`:

```swift
let double = { (n: Int) -> Int in
    return n * 2
}

double(21)   // 42
```

The type of `double` is `(Int) -> Int`: a function that takes an `Int` and returns an `Int`. You can write that type yourself, which also lets Swift infer the closure's parameter types:

```swift
let triple: (Int) -> Int = { n in n * 3 }
```

As with functions, a closure made of one expression returns that expression without `return`.

A named function can be used in the same places:

```swift
func half(_ n: Int) -> Int { n / 2 }
let operation: (Int) -> Int = half
operation(10)   // 5
```

# --instructions--

1. Create a closure constant `isEven` of type `(Int) -> Bool` that returns `true` for even numbers.
2. Create a closure constant `join` of type `(String, String) -> String` that joins two strings with a space between them.

# --tests--

`isEven(4)` should be `true` and `isEven(7)` should be `false`.

```swift
expect(isEven(4) && !isEven(7))
```

`join("Hello", "Swift")` should be `"Hello Swift"`.

```swift
expect(join("Hello", "Swift") == "Hello Swift")
```

`isEven` and `join` should be closures stored with `let`.

```source
let\s+isEven[^\n]*=\s*\{[\s\S]*let\s+join[^\n]*=\s*\{|let\s+join[^\n]*=\s*\{[\s\S]*let\s+isEven[^\n]*=\s*\{
```

# --seed--

```swift

```

# --solution--

```swift
let isEven: (Int) -> Bool = { n in n % 2 == 0 }
let join: (String, String) -> String = { a, b in a + " " + b }
```

---
id: closures-trailing
title: Passing closures
type: lesson
minutes: 9
---
# --description--

Closures are most useful when you hand them to another function, which calls them when it needs to. Here, `repeatTwice` takes a closure as its parameter:

```swift
func repeatTwice(_ action: () -> Void) {
    action()
    action()
}

repeatTwice({ print("Hip hip hooray!") })
```

`() -> Void` means a closure that takes nothing and returns nothing.

When a closure is the **last** argument, you can write it after the parentheses. This is **trailing closure** syntax, and it is everywhere in Swift and SwiftUI:

```swift
repeatTwice {
    print("Hip hip hooray!")
}
```

Swift also lets you shorten closures a lot. These all mean the same thing:

```swift
let sorted1 = names.sorted(by: { (a: String, b: String) -> Bool in return a < b })
let sorted2 = names.sorted(by: { a, b in a < b })
let sorted3 = names.sorted { $0 < $1 }   // $0 and $1 are the first and second parameters
let sorted4 = names.sorted(by: <)        // an operator is a function too
```

Use the short forms when the closure is tiny and obvious. When it is longer, name the parameters.

# --instructions--

1. Write `applyTwice(_:to:)`, which takes a closure of type `(Int) -> Int` and a starting `Int`, and returns the result of applying the closure twice. `applyTwice({ $0 + 3 }, to: 1)` returns `7`.
2. Create `byLength`: `words` sorted from shortest to longest, using `sorted` with a trailing closure.

# --tests--

`applyTwice({ $0 + 3 }, to: 1)` should return `7`.

```swift
expect(applyTwice({ $0 + 3 }, to: 1) == 7)
```

`applyTwice({ $0 * $0 }, to: 3)` should return `81`.

```swift
expect(applyTwice({ $0 * $0 }, to: 3) == 81)
```

`byLength` should be `["sun", "moon", "comet", "planet"]`.

```swift
expect(byLength == ["sun", "moon", "comet", "planet"])
```

You should use a trailing closure with `sorted`.

```source
words\.sorted\s*\{
```

# --seed--

```swift
let words = ["planet", "sun", "comet", "moon"]

```

# --solution--

```swift
let words = ["planet", "sun", "comet", "moon"]

func applyTwice(_ transform: (Int) -> Int, to value: Int) -> Int {
    transform(transform(value))
}

let byLength = words.sorted { $0.count < $1.count }
```

---
id: closures-map-filter-reduce
title: map, filter and reduce
type: lesson
minutes: 11
---
# --description--

Three closure-taking methods do much of the everyday work on collections. Each one replaces a hand-written loop with a single, clear line.

**`map`** transforms every item and gives you a new array:

```swift
let prices = [4.0, 10.0, 2.5]
let withTax = prices.map { $0 * 1.2 }   // [4.8, 12.0, 3.0]
let labels = prices.map { "£\($0)" }    // the type can change too
```

**`filter`** keeps the items for which the closure returns `true`:

```swift
let cheap = prices.filter { $0 < 5 }    // [4.0, 2.5]
```

**`reduce`** combines every item into one value. You give it a starting value and a closure that adds one item to the running result:

```swift
let total = prices.reduce(0, +)                  // 16.5
let longest = ["a", "abc", "ab"].reduce("") { $0.count >= $1.count ? $0 : $1 }
```

Two relatives are worth knowing straight away:

```swift
let numbers = ["1", "two", "3"].compactMap { Int($0) }  // [1, 3]: drops the nils
let anyFree = prices.contains { $0 == 0 }               // false
```

They chain together into a short story about your data:

```swift
let result = prices.filter { $0 > 3 }.map { $0 * 2 }.reduce(0, +)   // 28.0
```

# --instructions--

`orders` is a list of order amounts. Using `map`, `filter`, `reduce` and `compactMap`:

1. `bigOrders`: the orders over `100`.
2. `doubled`: every order multiplied by `2`.
3. `revenue`: the sum of all orders.
4. `codes`: the numbers that can be read from `rawCodes`, skipping any that are not numbers.

# --tests--

`bigOrders` should be `[120, 250]`.

```swift
expect(bigOrders == [120, 250])
```

`doubled` should be `[80, 240, 30, 500]`.

```swift
expect(doubled == [80, 240, 30, 500])
```

`revenue` should be `425`.

```swift
expect(revenue == 425)
```

`codes` should be `[7, 42]`.

```swift
expect(codes == [7, 42])
```

You should use `filter`, `map`, `reduce` and `compactMap`.

```source
(?=[\s\S]*\.filter)(?=[\s\S]*\.map)(?=[\s\S]*\.reduce)(?=[\s\S]*\.compactMap)
```

# --seed--

```swift
let orders = [40, 120, 15, 250]
let rawCodes = ["7", "x", "42", ""]

```

# --solution--

```swift
let orders = [40, 120, 15, 250]
let rawCodes = ["7", "x", "42", ""]

let bigOrders = orders.filter { $0 > 100 }
let doubled = orders.map { $0 * 2 }
let revenue = orders.reduce(0, +)
let codes = rawCodes.compactMap { Int($0) }
```

---
id: closures-capturing
title: Capturing values
type: lesson
minutes: 9
---
# --description--

A closure can use constants and variables from around where it was written. It **captures** them, keeping them alive as long as the closure lives.

```swift
func makeCounter() -> () -> Int {
    var count = 0
    return {
        count += 1
        return count
    }
}

let next = makeCounter()
next()   // 1
next()   // 2
let other = makeCounter()
other()  // 1: each counter has its own count
```

`count` belongs to `makeCounter`, which has finished running, yet the closure still reaches it. Each call to `makeCounter` makes a fresh `count`, captured by a fresh closure.

This is what lets a button in an app remember what to do when it is tapped long after the code that set it up has run.

> **Note** When a closure is stored to be called later, Swift marks the parameter `@escaping`. You will see it in function signatures like `func onTap(_ action: @escaping () -> Void)`. It reminds you the closure outlives the call, and it matters when you learn about memory in Classes.

# --instructions--

Write `makeAccumulator(start:)`, which takes an `Int` and returns a closure of type `(Int) -> Int`. Each time the closure is called with a number, it adds that number to a running total, which begins at `start`, and returns the new total.

# --tests--

An accumulator starting at `10` should give `15`, then `18`.

```swift
let add = makeAccumulator(start: 10)
expect(add(5) == 15)
expect(add(3) == 18)
```

Two accumulators should keep separate totals.

```swift
let a = makeAccumulator(start: 0)
let b = makeAccumulator(start: 100)
_ = a(1)
expect(b(1) == 101 && a(1) == 2)
```

# --seed--

```swift

```

# --solution--

```swift
func makeAccumulator(start: Int) -> (Int) -> Int {
    var total = start
    return { amount in
        total += amount
        return total
    }
}
```

---
id: closures-lab-gradebook
title: "Lab: a gradebook"
type: lab
minutes: 15
---
# --description--

A teacher keeps marks for each student in a dictionary. Use closures to answer questions about the class, without writing a single `for` loop.

# --instructions--

1. `averages`: a `[String: Double]` with each student's average mark. Use `mapValues`, which works like `map` on a dictionary's values.
2. `honours`: an alphabetically sorted array of the students whose average is `85` or more.
3. `classAverage`: the average of every single mark in the class, as a `Double`. `marks.values.flatMap { $0 }` gives you one array of all the marks.
4. `report`: one line per student, sorted by name, like `"Ana: 91.0"`, joined with new lines. Use `.joined(separator: "\n")`.

Print `report`.

# --tests--

`averages["Ben"]` should be `75.0`.

```swift
expect(averages["Ben"] == 75.0 && averages.count == 3)
```

`honours` should be `["Ana", "Cleo"]`.

```swift
expect(honours == ["Ana", "Cleo"])
```

`classAverage` should be `84.0`.

```swift
expect(abs(classAverage - 84.0) < 0.0001)
```

Your program should print the report.

```output
^Ana: 91\.0\nBen: 75\.0\nCleo: 86\.0$
```

You should not use a `for` loop.

```!source
\bfor\s+\w+\s+in\b
```

# --seed--

```swift
let marks = [
    "Ana": [88, 94, 91],
    "Ben": [70, 80, 75],
    "Cleo": [90, 82, 86],
]

```

# --solution--

```swift
let marks = [
    "Ana": [88, 94, 91],
    "Ben": [70, 80, 75],
    "Cleo": [90, 82, 86],
]

let averages = marks.mapValues { Double($0.reduce(0, +)) / Double($0.count) }
let honours = averages.filter { $0.value >= 85 }.map { $0.key }.sorted()
let all = marks.values.flatMap { $0 }
let classAverage = Double(all.reduce(0, +)) / Double(all.count)
let report = averages.keys.sorted().map { "\($0): \(averages[$0] ?? 0)" }.joined(separator: "\n")
print(report)
```

---
id: closures-quiz
title: "Quiz: closures"
type: quiz
minutes: 4
---
# --description--

Five questions on closures.

# --questions--

## What is the type of `{ (a: Int, b: Int) in a + b }`?
- [ ] `Int`
- [x] `(Int, Int) -> Int`
- [ ] `(Int) -> (Int)`
Why: It takes two `Int` values and returns their sum, an `Int`.

## What does `[1, 2, 3].map { $0 * 10 }` give?
- [ ] `60`
- [x] `[10, 20, 30]`
- [ ] `[1, 2, 3, 10]`
Why: `map` transforms each item and returns a new array.

## Which method keeps only some items?
- [ ] `map`
- [ ] `reduce`
- [x] `filter`
Why: `filter` keeps the items for which the closure returns `true`.

## What does `["4", "x", "6"].compactMap { Int($0) }` give?
- [x] `[4, 6]`
- [ ] `[4, nil, 6]`
- [ ] A crash
Why: `compactMap` drops every `nil` result.

## Why does each call to a `makeCounter()` function get its own count?
- [ ] Closures cannot use outside variables
- [x] Each call creates a new variable, which its own closure captures
- [ ] Swift resets the count every time
Why: Captured variables live as long as the closure that captured them.
