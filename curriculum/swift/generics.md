---
id: generics-functions
title: Generic functions
type: lesson
minutes: 10
---
# --description--

Suppose you want a function that swaps the first and last items of an array. You could write one for `[Int]`, another for `[String]`, another for `[Double]`… or write it once, for **any** type:

```swift
func swapEnds<T>(_ items: [T]) -> [T] {
    guard items.count > 1 else { return items }
    var copy = items
    copy.swapAt(0, items.count - 1)
    return copy
}

swapEnds([1, 2, 3])        // [3, 2, 1]
swapEnds(["a", "b"])       // ["b", "a"]
```

`<T>` introduces a **type parameter**: a placeholder for a real type, filled in each time the function is called. Inside, `T` stands for "whatever type the caller used", and Swift checks everything is consistent: you cannot sneak a `String` into an `[Int]`.

You have been using generics all along. `Array<Int>` is the long way to write `[Int]`, and `Optional<String>` is `String?`. Swift's collections are written once, generically, and work for every type.

Type parameters can have short names like `T` or `Element`, or descriptive ones when it helps: `func pair<Key, Value>(...)`.

# --instructions--

1. Write a generic function `repeated(_:times:)` that takes a value of any type and a count, and returns an array with the value repeated that many times.
2. Write a generic function `lastTwo(_:)` that returns the last two items of any array, or the whole array if it has fewer than two.

# --tests--

`repeated("ha", times: 3)` should be `["ha", "ha", "ha"]`.

```swift
expect(repeated("ha", times: 3) == ["ha", "ha", "ha"])
```

`repeated(7, times: 2)` should be `[7, 7]`.

```swift
expect(repeated(7, times: 2) == [7, 7])
```

`lastTwo` should work for any array.

```swift
expect(lastTwo([1, 2, 3, 4]) == [3, 4] && lastTwo(["x"]) == ["x"])
```

You should use a type parameter.

```source
func\s+repeated\s*<\s*\w+\s*>
```

# --seed--

```swift

```

# --solution--

```swift
func repeated<T>(_ value: T, times: Int) -> [T] {
    Array(repeating: value, count: times)
}

func lastTwo<T>(_ items: [T]) -> [T] {
    Array(items.suffix(2))
}
```

---
id: generics-constraints
title: Constraints
type: lesson
minutes: 10
---
# --description--

A plain `T` can be anything, so you can do very little with it: you cannot compare two `T` values, because not every type can be compared. A **constraint** asks for a type that conforms to a protocol, and in return you can use what that protocol provides:

```swift
func largest<T: Comparable>(_ items: [T]) -> T? {
    guard var best = items.first else { return nil }
    for item in items where item > best { best = item }
    return best
}

largest([3, 9, 2])          // 9
largest(["pear", "apple"])  // "pear"
```

`T: Comparable` says "any type, as long as it is `Comparable`", which is why `>` works.

For more than one requirement, or requirements on related types, use a `where` clause:

```swift
func allEqual<T>(_ items: [T]) -> Bool where T: Equatable {
    items.allSatisfy { $0 == items.first }
}
```

And with `some`, which you met in Protocols, there is a lighter way to write a simple constrained parameter:

```swift
func printAll(_ items: [some CustomStringConvertible]) {
    for item in items { print(item) }
}
```

# --instructions--

1. Write `countMatches(_:in:)`, generic over an `Equatable` type, that counts how many times a value appears in an array.
2. Write `uniqueSorted(_:)`, generic over a type that is both `Hashable` and `Comparable`, that returns the array's unique items, sorted.

# --tests--

`countMatches(2, in: [1, 2, 2, 3, 2])` should be `3`.

```swift
expect(countMatches(2, in: [1, 2, 2, 3, 2]) == 3)
```

`countMatches("a", in: ["b"])` should be `0`.

```swift
expect(countMatches("a", in: ["b"]) == 0)
```

`uniqueSorted([3, 1, 3, 2, 1])` should be `[1, 2, 3]`.

```swift
expect(uniqueSorted([3, 1, 3, 2, 1]) == [1, 2, 3])
```

`uniqueSorted(["b", "a", "b"])` should be `["a", "b"]`.

```swift
expect(uniqueSorted(["b", "a", "b"]) == ["a", "b"])
```

You should constrain the type parameters.

```source
Equatable[\s\S]*(Hashable\s*&\s*Comparable|Comparable\s*&\s*Hashable|Hashable[\s\S]*Comparable)
```

# --seed--

```swift

```

# --solution--

```swift
func countMatches<T: Equatable>(_ value: T, in items: [T]) -> Int {
    items.filter { $0 == value }.count
}

func uniqueSorted<T: Hashable & Comparable>(_ items: [T]) -> [T] {
    Set(items).sorted()
}
```

---
id: generics-types
title: Generic types
type: lesson
minutes: 11
---
# --description--

Types can be generic too. Here is a **stack**, a pile where you add and remove from the top, that works for any element type:

```swift
struct Stack<Element> {
    private var items: [Element] = []

    mutating func push(_ item: Element) {
        items.append(item)
    }

    mutating func pop() -> Element? {
        items.popLast()
    }

    var top: Element? { items.last }
    var isEmpty: Bool { items.isEmpty }
}

var undo = Stack<String>()
undo.push("typed a")
undo.push("typed b")
undo.pop()   // "typed b"
```

`private` means only code inside `Stack` can touch `items`, so nobody can mess up the pile. You will learn more about access control later.

You can add abilities only for some element types, with a constrained extension:

```swift
extension Stack where Element: Numeric {
    var sum: Element { items.reduce(0, +) }
}
```

Protocols can be generic in their own way, with an **associated type**: a placeholder the conforming type fills in. `Sequence` is like this: its `Element` is whatever it holds. You will use associated types far more often than you write them, so it is enough to recognise one when you see `associatedtype` in a protocol.

# --instructions--

Write a generic struct `Queue<Element>`: first in, first out, like a line of people.

- `mutating func enqueue(_:)` adds to the back.
- `mutating func dequeue() -> Element?` removes from the front, or returns `nil` if empty.
- `var count: Int`.
- Keep the storage `private`.

# --tests--

A queue should give items back in the order they were added.

```swift
var q = Queue<String>()
q.enqueue("Ana"); q.enqueue("Ben")
expect(q.dequeue() == "Ana" && q.dequeue() == "Ben" && q.dequeue() == nil)
```

`count` should track the size.

```swift
var q = Queue<Int>()
q.enqueue(1); q.enqueue(2); q.enqueue(3)
_ = q.dequeue()
expect(q.count == 2)
```

`Queue` should be generic, with private storage.

```source
struct\s+Queue\s*<\s*Element\s*>[\s\S]*private\s+var
```

# --seed--

```swift

```

# --solution--

```swift
struct Queue<Element> {
    private var items: [Element] = []

    mutating func enqueue(_ item: Element) {
        items.append(item)
    }

    mutating func dequeue() -> Element? {
        items.isEmpty ? nil : items.removeFirst()
    }

    var count: Int { items.count }
}
```

---
id: generics-quiz
title: "Quiz: generics"
type: quiz
minutes: 3
---
# --description--

Four questions on generics.

# --questions--

## In `func first<T>(_ items: [T]) -> T?`, what is `T`?
- [ ] A type called `T` you must define
- [x] A placeholder for whatever type the caller uses
- [ ] Always `Int`
Why: Each call fills in `T` with a real type.

## Why does `func biggest<T: Comparable>` allow `>` inside, when `func biggest<T>` does not?
- [x] The constraint guarantees `T` can be compared
- [ ] `>` only works on generics with constraints
- [ ] It does not: both allow it
Why: Constraints tell Swift what a type can do.

## What is `[Int]` the short form of?
- [ ] `Set<Int>`
- [x] `Array<Int>`
- [ ] `Optional<Int>`
Why: Arrays are a generic type in Swift's standard library.

## What does `extension Stack where Element: Numeric` do?
- [ ] Adds abilities to every stack
- [x] Adds abilities only to stacks of numbers
- [ ] Turns every stack into a number
Why: A constrained extension applies only when the condition holds.
