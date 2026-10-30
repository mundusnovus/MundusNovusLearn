---
id: concurrency-async-await
title: async and await
type: lesson
minutes: 11
---
# --description--

Some work takes time: downloading a file, reading from a disk, asking a server. An app must not freeze while it waits. Swift's answer is **async functions**.

Mark a function `async` when it may need to wait. Call it with `await`, which marks the spot where your code may pause:

```swift
func fetchTemperature() async -> Double {
    try? await Task.sleep(for: .seconds(1))   // pretend to wait for a server
    return 21.5
}

let t = await fetchTemperature()
print(t)
```

While one piece of code is paused at an `await`, the system is free to do other work, such as keeping your app's interface responsive. When the result arrives, your code carries on from the same line, with all its variables just as they were. It reads top to bottom, like ordinary code, which is the whole point.

`async` combines with `throws`. Write both on the function, and both on the call, in this order:

```swift
func download(_ name: String) async throws -> String { ... }
let file = try await download("photo.jpg")
```

You can only `await` inside something that is itself async. In an app, you start async work from ordinary code with `Task`:

```swift
Task {
    let t = await fetchTemperature()
    print(t)
}
```

Here, the code you write runs at the top level of a program, which Swift allows to `await` directly.

# --instructions--

1. Write `fetchUsername(id:) async -> String` that waits `10` milliseconds with `try? await Task.sleep(for: .milliseconds(10))`, then returns `"user\(id)"`.
2. Write `fetchGreeting(id:) async -> String` that awaits `fetchUsername` and returns `"Welcome back, <name>!"`.
3. Print `await fetchGreeting(id: 42)`.

# --tests--

`fetchUsername(id: 3)` should return `"user3"`.

```swift
let name = await fetchUsername(id: 3)
expect(name == "user3")
```

`fetchGreeting(id: 7)` should return `"Welcome back, user7!"`.

```swift
let greeting = await fetchGreeting(id: 7)
expect(greeting == "Welcome back, user7!")
```

Your program should print `Welcome back, user42!`.

```output
^Welcome back, user42!$
```

Both functions should be `async`, and `fetchUsername` should sleep.

```source
func\s+fetchUsername[^{]*async[\s\S]*Task\.sleep
```

# --seed--

```swift

```

# --solution--

```swift
func fetchUsername(id: Int) async -> String {
    try? await Task.sleep(for: .milliseconds(10))
    return "user\(id)"
}

func fetchGreeting(id: Int) async -> String {
    let name = await fetchUsername(id: id)
    return "Welcome back, \(name)!"
}

print(await fetchGreeting(id: 42))
```

---
id: concurrency-async-let
title: Doing things at the same time
type: lesson
minutes: 11
---
# --description--

`await` one thing after another, and each waits for the one before:

```swift
let a = await fetchPrice("apples")   // 1 second
let b = await fetchPrice("pears")    // another second
```

If the two do not depend on each other, start them **together** with `async let`. Each begins straight away, and you `await` the results when you need them:

```swift
async let a = fetchPrice("apples")
async let b = fetchPrice("pears")
let total = await a + b              // about 1 second in all
```

When you have a list of things to do in parallel, and do not know how many ahead of time, use a **task group**:

```swift
let prices = await withTaskGroup(of: Double.self) { group in
    for item in ["apples", "pears", "plums"] {
        group.addTask { await fetchPrice(item) }
    }
    var sum = 0.0
    for await price in group {   // results arrive as each task finishes
        sum += price
    }
    return sum
}
```

`async let` and task groups are **structured concurrency**: the child tasks cannot outlive the code that started them. If the parent finishes, throws or is cancelled, Swift waits for or cancels the children. Nothing is left running in the background by accident.

# --instructions--

`fetchPrice(_:)` is written for you; it waits a little and returns a price.

1. Write `basket() async -> Double`, which fetches `"apples"` and `"pears"` **at the same time** with `async let` and returns their sum.
2. Write `totalPrice(of:) async -> Double`, which fetches the price of every item in an array in parallel with a task group and returns the sum.

# --tests--

`basket()` should be `5.0`.

```swift
let b = await basket()
expect(b == 5.0)
```

`totalPrice(of: ["apples", "pears", "plums"])` should be `9.0`.

```swift
let t = await totalPrice(of: ["apples", "pears", "plums"])
expect(t == 9.0)
```

You should use `async let` and `withTaskGroup`.

```source
async\s+let[\s\S]*withTaskGroup|withTaskGroup[\s\S]*async\s+let
```

# --seed--

```swift
func fetchPrice(_ item: String) async -> Double {
    try? await Task.sleep(for: .milliseconds(20))
    switch item {
    case "apples": return 2.0
    case "pears": return 3.0
    case "plums": return 4.0
    default: return 0
    }
}

```

# --solution--

```swift
func fetchPrice(_ item: String) async -> Double {
    try? await Task.sleep(for: .milliseconds(20))
    switch item {
    case "apples": return 2.0
    case "pears": return 3.0
    case "plums": return 4.0
    default: return 0
    }
}

func basket() async -> Double {
    async let apples = fetchPrice("apples")
    async let pears = fetchPrice("pears")
    return await apples + pears
}

func totalPrice(of items: [String]) async -> Double {
    await withTaskGroup(of: Double.self) { group in
        for item in items {
            group.addTask { await fetchPrice(item) }
        }
        var sum = 0.0
        for await price in group {
            sum += price
        }
        return sum
    }
}
```

---
id: concurrency-actors
title: Actors
type: lesson
minutes: 12
---
# --description--

When several tasks run at once, they must not change the same data at the same moment. If two tasks both read a counter as 5 and both write 6, one increment is lost. This is a **data race**, and it causes the worst kind of bug: rare, random and hard to reproduce.

An **actor** is a type that protects its state from data races. It looks like a class, but only one task can be inside it at a time:

```swift
actor BankAccount {
    private(set) var balance = 0.0

    func deposit(_ amount: Double) {
        balance += amount
    }
}
```

From outside, every use of an actor is `await`ed, because you may have to wait your turn:

```swift
let account = BankAccount()
await account.deposit(50)
print(await account.balance)
```

Inside the actor, its own methods use its state directly, with no `await`, because they already have exclusive access.

`private(set)` means anyone may read `balance`, but only the actor itself can change it.

Swift 6 checks for data races **when it compiles**. If your code could race, it will not build. That can feel strict at first, but it means a whole category of crashes simply cannot reach the people using your app.

# --instructions--

Write an actor `TicketCounter`:

- `private(set) var sold = 0` and a constant `capacity`, set by `init(capacity:)`.
- `func sell() -> Bool`: if there is room, add one to `sold` and return `true`; otherwise return `false`.

The code at the bottom sells tickets from 100 tasks at once. With an actor, exactly `capacity` tickets are sold, never more.

# --tests--

Selling from many tasks at once should never sell more than the capacity.

```swift
let counter = TicketCounter(capacity: 30)
await withTaskGroup(of: Bool.self) { group in
    for _ in 0..<100 { group.addTask { await counter.sell() } }
}
let sold = await counter.sold
expect(sold == 30)
```

`sell()` should return `false` once the counter is full.

```swift
let counter = TicketCounter(capacity: 1)
let first = await counter.sell()
let second = await counter.sell()
expect(first && !second)
```

`TicketCounter` should be an actor.

```source
actor\s+TicketCounter
```

# --seed--

```swift

```

# --solution--

```swift
actor TicketCounter {
    private(set) var sold = 0
    let capacity: Int

    init(capacity: Int) {
        self.capacity = capacity
    }

    func sell() -> Bool {
        guard sold < capacity else { return false }
        sold += 1
        return true
    }
}
```

---
id: concurrency-main-actor
title: The main actor and Sendable
type: lesson
minutes: 13
---
# --description--

## The main actor

Every app has one special actor: the **main actor**. It runs your user interface. All drawing and every update to what is on screen happens there.

Since Xcode 26, a new app project puts your code on the main actor **by default**. It is called "approachable concurrency", and the exercises on this site use the same settings. It means everyday code needs no annotations at all: it simply runs on the main actor, safe to touch the interface.

When you have slow work that should **not** hold up the interface, such as resizing a big image or parsing a large file, mark it `@concurrent`. It then runs in the background, and callers `await` it:

```swift
@concurrent
func makeThumbnail(from data: [UInt8]) async -> [UInt8] {
    // heavy work here runs off the main actor
    Array(data.prefix(100))
}

let thumb = await makeThumbnail(from: photo)
```

`nonisolated` marks something that belongs to no actor at all, such as a pure function that only uses its parameters.

## Sendable

Values that cross from one actor or task to another must be safe to share. Swift calls these types **Sendable**:

- Structs and enums made of sendable parts are sendable automatically.
- Actors are always sendable: they protect themselves.
- A class is only sendable if it is `final` with constant (`let`) sendable properties, or protects its state some other way.

When the compiler says a type "is not Sendable", it has found a place where data could be raced. The usual fixes, in order: make it a struct, make it an actor, or keep it on one actor (often the main actor) and do not send it anywhere.

# --instructions--

1. Write `nonisolated func wordCount(_ text: String) -> Int` that counts the words in `text`, splitting on spaces.
2. Write `@concurrent func countAll(_ texts: [String]) async -> Int` that adds up `wordCount` for every text.
3. Make `Article` a struct with `title` and `body`, so it is `Sendable`, and `print(await countAll(articles.map(\.body)))`.

# --tests--

`wordCount("one two three")` should be `3`.

```swift
expect(wordCount("one two three") == 3)
```

`countAll` should add up every text, off the main actor.

```swift
let n = await countAll(["a b", "c d e"])
expect(n == 5)
```

```source
@concurrent[\s\S]*func\s+countAll
```

`Article` should be a struct, and the program should print `6`.

```source
struct\s+Article
```

```output
^6$
```

# --seed--

```swift
let articles = [
    Article(title: "Swift", body: "Swift is fast"),
    Article(title: "Apps", body: "Apps are fun"),
]

```

# --solution--

```swift
struct Article {
    let title: String
    let body: String
}

let articles = [
    Article(title: "Swift", body: "Swift is fast"),
    Article(title: "Apps", body: "Apps are fun"),
]

nonisolated func wordCount(_ text: String) -> Int {
    text.split(separator: " ").count
}

@concurrent
func countAll(_ texts: [String]) async -> Int {
    texts.reduce(0) { $0 + wordCount($1) }
}

print(await countAll(articles.map(\.body)))
```

---
id: concurrency-streams
title: Async sequences and cancellation
type: lesson
minutes: 12
---
# --description--

## Async sequences

Some data arrives over time: messages in a chat, readings from a sensor, lines of a file being downloaded. An **async sequence** delivers values one at a time, and you loop over it with `for await`:

```swift
for await message in chat.messages {
    print(message)
}
```

You can make your own with `AsyncStream`. Its closure gets a **continuation**: call `yield` to send a value, and `finish` when there are no more:

```swift
let countdown = AsyncStream<Int> { continuation in
    Task {
        for n in stride(from: 3, through: 1, by: -1) {
            continuation.yield(n)
            try? await Task.sleep(for: .milliseconds(10))
        }
        continuation.finish()
    }
}

for await n in countdown { print(n) }   // 3, 2, 1
```

## Cancellation

A task can be **cancelled**, for example when the person leaves the screen that started it. Cancellation does not stop code by force; it sets a flag, and well-behaved async code checks it and stops early:

```swift
let task = Task {
    for i in 1...1_000 {
        try Task.checkCancellation()   // throws CancellationError if cancelled
        await process(i)
    }
}
task.cancel()
```

`Task.sleep` notices cancellation too, and throws. In SwiftUI, the `.task` modifier starts work when a view appears and cancels it automatically when the view goes away.

# --instructions--

1. Write `ticks(_ count: Int) -> AsyncStream<Int>`, which yields `1` up to `count`, then finishes.
2. Write `sumTicks(_:) async -> Int`, which loops over `ticks` with `for await` and returns the sum.
3. Write `sumUntilCancelled() async -> Int`, which adds up `1, 2, 3, …` forever, but checks `Task.isCancelled` on every pass and returns the sum so far when cancelled. Sleep for `1` millisecond on every pass with `try? await Task.sleep(for: .milliseconds(1))`.

# --tests--

`sumTicks(4)` should be `10`.

```swift
let s = await sumTicks(4)
expect(s == 10)
```

`sumTicks(0)` should be `0`.

```swift
let s = await sumTicks(0)
expect(s == 0)
```

`sumUntilCancelled` should stop when its task is cancelled.

```swift
let task = Task { await sumUntilCancelled() }
try? await Task.sleep(for: .milliseconds(30))
task.cancel()
let result = await task.value
expect(result > 0)
```

You should use `for await` and check for cancellation.

```source
for\s+await[\s\S]*isCancelled|isCancelled[\s\S]*for\s+await
```

# --seed--

```swift

```

# --solution--

```swift
func ticks(_ count: Int) -> AsyncStream<Int> {
    AsyncStream { continuation in
        for n in stride(from: 1, through: count, by: 1) {
            continuation.yield(n)
        }
        continuation.finish()
    }
}

func sumTicks(_ count: Int) async -> Int {
    var sum = 0
    for await n in ticks(count) {
        sum += n
    }
    return sum
}

func sumUntilCancelled() async -> Int {
    var sum = 0
    var n = 1
    while !Task.isCancelled {
        sum += n
        n += 1
        try? await Task.sleep(for: .milliseconds(1))
    }
    return sum
}
```

---
id: concurrency-quiz
title: "Quiz: concurrency"
type: quiz
minutes: 5
---
# --description--

Six questions on Swift concurrency.

# --questions--

## What does `await` mark?
- [x] A place where the code may pause while it waits, letting other work run
- [ ] A line that runs in the background
- [ ] A line that cannot fail
Why: The function pauses there and resumes on the same line when the result is ready.

## Two independent downloads take a second each. What is the fastest way to get both?
- [ ] `await` one, then `await` the other
- [x] Start both with `async let`, then `await` both
- [ ] Use a `for` loop
Why: `async let` starts each immediately, so they overlap.

## What problem do actors solve?
- [ ] Slow code
- [x] Data races: two tasks changing the same state at once
- [ ] Memory leaks
Why: Only one task can be inside an actor at a time.

## In a new Xcode 27 app project, where does your code run unless it says otherwise?
- [x] On the main actor
- [ ] In the background
- [ ] On a random thread
Why: Approachable concurrency makes the main actor the default.

## What does marking a function `@concurrent` do?
- [ ] Makes it run twice
- [x] Runs it off the main actor, so heavy work does not hold up the interface
- [ ] Makes it synchronous
Why: Use it for slow work, and `await` it from the main actor.

## What happens when you cancel a task?
- [ ] It is killed instantly
- [x] A flag is set; well-behaved code checks it and stops early
- [ ] Nothing at all
Why: Cancellation is cooperative: check `Task.isCancelled` or call `Task.checkCancellation()`.
