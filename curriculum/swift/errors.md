---
id: errors-throwing
title: Throwing errors
type: lesson
minutes: 11
---
# --description--

Some operations can fail for reasons you cannot rule out ahead of time: a file is missing, a network request fails, a user types something invalid. An optional says "there might be no value". An **error** says *why* there is none.

An error is any type that conforms to `Error`. Enums are the usual choice, one case per thing that can go wrong:

```swift
enum WithdrawError: Error {
    case insufficientFunds(needed: Double)
    case accountFrozen
}
```

A function that can fail is marked `throws`, and uses `throw` to report a problem. Throwing ends the function immediately:

```swift
func withdraw(_ amount: Double, from balance: Double) throws -> Double {
    guard balance >= amount else {
        throw WithdrawError.insufficientFunds(needed: amount - balance)
    }
    return balance - amount
}
```

Calling a throwing function needs `try`, inside a `do` block, with `catch` blocks to handle the errors:

```swift
do {
    let left = try withdraw(50, from: 30)
    print("Left: \(left)")
} catch WithdrawError.insufficientFunds(let needed) {
    print("You need \(needed) more.")
} catch {
    print("Something else went wrong: \(error)")
}
```

The final `catch` with no pattern catches everything else, and gives you the error as `error`. The word `try` marks every place that can fail, so you can see the risky lines at a glance.

# --instructions--

1. Define an enum `TicketError: Error` with the cases `soldOut` and `tooYoung(minimumAge: Int)`.
2. Write `buyTicket(age:seatsLeft:) throws -> String`. It throws `soldOut` if `seatsLeft` is `0`, and `tooYoung(minimumAge: 12)` if `age` is under `12`. Otherwise it returns `"Ticket booked"`.
3. Write `attempt(age:seatsLeft:) -> String`, which calls `buyTicket` and returns its result, `"Sold out"` for `soldOut`, or `"Must be <n> or older"` for `tooYoung`.

# --tests--

`attempt(age: 30, seatsLeft: 5)` should be `"Ticket booked"`.

```swift
expect(attempt(age: 30, seatsLeft: 5) == "Ticket booked")
```

`attempt(age: 30, seatsLeft: 0)` should be `"Sold out"`.

```swift
expect(attempt(age: 30, seatsLeft: 0) == "Sold out")
```

`attempt(age: 8, seatsLeft: 5)` should be `"Must be 12 or older"`.

```swift
expect(attempt(age: 8, seatsLeft: 5) == "Must be 12 or older")
```

`buyTicket` should throw.

```swift
var threw = false
do { _ = try buyTicket(age: 5, seatsLeft: 1) } catch { threw = true }
expect(threw)
```

# --seed--

```swift

```

# --solution--

```swift
enum TicketError: Error {
    case soldOut
    case tooYoung(minimumAge: Int)
}

func buyTicket(age: Int, seatsLeft: Int) throws -> String {
    guard seatsLeft > 0 else { throw TicketError.soldOut }
    guard age >= 12 else { throw TicketError.tooYoung(minimumAge: 12) }
    return "Ticket booked"
}

func attempt(age: Int, seatsLeft: Int) -> String {
    do {
        return try buyTicket(age: age, seatsLeft: seatsLeft)
    } catch TicketError.soldOut {
        return "Sold out"
    } catch TicketError.tooYoung(let minimum) {
        return "Must be \(minimum) or older"
    } catch {
        return "Something went wrong"
    }
}
```

---
id: errors-typed-try
title: Typed throws, try? and try!
type: lesson
minutes: 10
---
# --description--

## Typed throws

By default a throwing function can throw any `Error`, which is why a final `catch` is needed to be exhaustive. When a function can only throw one error type, you can say so with **typed throws**:

```swift
func parse(_ text: String) throws(ParseError) -> Int {
    guard let n = Int(text) else { throw .notANumber }
    return n
}

do {
    let n = try parse("12")
} catch {
    // here `error` is a ParseError, so a switch over it is exhaustive
    switch error {
    case .notANumber: print("Not a number")
    }
}
```

Use typed throws when callers need to handle each case exactly, especially inside a module. For public APIs that may grow new errors, plain `throws` stays more flexible.

## try? and try!

`try?` turns a throwing call into an optional: the value if it worked, `nil` if it threw. It is perfect when you do not care *why* something failed:

```swift
let n = try? parse("abc")   // nil
```

`try!` says "this cannot fail", and crashes if it does. Like `!` on optionals, keep it for cases where a failure would mean a bug in your own code.

## Errors in, errors out

A throwing function can call other throwing functions with plain `try` and let their errors pass straight through to its caller. You do not need `do`/`catch` at every level, only where you can actually handle the problem.

# --instructions--

1. Define `enum ScoreError: Error` with `empty` and `outOfRange(Int)`.
2. Write `parseScore(_:) throws(ScoreError) -> Int` that throws `.empty` for an empty string, `.outOfRange(n)` for a number outside `0...100`, and also `.empty` for text that is not a number. Otherwise it returns the number.
3. Write `validScores(_:) -> [Int]`, which keeps only the strings that parse, using `try?` and `compactMap`.

# --tests--

`parseScore("87")` should return `87`.

```swift
expect((try? parseScore("87")) == 87)
```

`parseScore("150")` should throw `.outOfRange(150)`.

```swift
var caught: ScoreError? = nil
do { _ = try parseScore("150") } catch { caught = error }
if case .outOfRange(let n) = caught { expect(n == 150) } else { expect(false) }
```

`parseScore` should use typed throws.

```source
throws\s*\(\s*ScoreError\s*\)
```

`validScores(["90", "", "x", "101", "45"])` should be `[90, 45]`.

```swift
expect(validScores(["90", "", "x", "101", "45"]) == [90, 45])
```

# --seed--

```swift

```

# --solution--

```swift
enum ScoreError: Error {
    case empty
    case outOfRange(Int)
}

func parseScore(_ text: String) throws(ScoreError) -> Int {
    guard !text.isEmpty, let n = Int(text) else { throw .empty }
    guard (0...100).contains(n) else { throw .outOfRange(n) }
    return n
}

func validScores(_ texts: [String]) -> [Int] {
    texts.compactMap { try? parseScore($0) }
}
```

---
id: errors-result
title: Result and defer
type: lesson
minutes: 9
---
# --description--

## Result

`Result` is an enum that holds either a success value or a failure error:

```swift
enum Result<Success, Failure: Error> {
    case success(Success)
    case failure(Failure)
}
```

It is useful when you want to **store** an outcome, or pass it around, rather than handle it right away:

```swift
let outcome = Result { try parse("42") }   // .success(42)

switch outcome {
case .success(let n): print(n)
case .failure(let e): print("Failed: \(e)")
}

let value = try outcome.get()   // turns it back into throw-or-value
```

With `async`/`await`, which comes next, you will throw errors far more often than you build `Result` values, but you will meet `Result` in plenty of code.

## defer

`defer` schedules code to run when the current scope ends, **however** it ends: a normal finish, a `return`, or a thrown error. It is the place for clean-up you must never forget:

```swift
func process() throws {
    print("Opening file")
    defer { print("Closing file") }
    try doRiskyWork()        // even if this throws, the file closes
}
```

# --instructions--

1. Write `safeDivide(_:by:) -> Result<Int, DivisionError>` that returns `.failure(.byZero)` when dividing by zero, and `.success` with the quotient otherwise. `DivisionError` is written for you.
2. Write `describe(_:)` that takes such a `Result` and returns `"= <n>"` for success or `"Cannot divide by zero"` for failure.
3. Write `logged(_:) throws -> Int`, which prints `start`, uses `defer` to print `end`, then returns `try safeDivide(...).get()` for `100` divided by its parameter.

# --tests--

`describe(safeDivide(10, by: 2))` should be `"= 5"`.

```swift
expect(describe(safeDivide(10, by: 2)) == "= 5")
```

`describe(safeDivide(1, by: 0))` should be `"Cannot divide by zero"`.

```swift
expect(describe(safeDivide(1, by: 0)) == "Cannot divide by zero")
```

`logged(0)` should throw, but still print `end` after `start`.

```swift
var threw = false
do { _ = try logged(0) } catch { threw = true }
expect(threw)
```

```output
^start\nend$
```

`logged` should use `defer`.

```source
defer\s*\{
```

# --seed--

```swift
enum DivisionError: Error {
    case byZero
}

```

# --solution--

```swift
enum DivisionError: Error {
    case byZero
}

func safeDivide(_ a: Int, by b: Int) -> Result<Int, DivisionError> {
    b == 0 ? .failure(.byZero) : .success(a / b)
}

func describe(_ result: Result<Int, DivisionError>) -> String {
    switch result {
    case .success(let n): "= \(n)"
    case .failure: "Cannot divide by zero"
    }
}

func logged(_ divisor: Int) throws -> Int {
    print("start")
    defer { print("end") }
    return try safeDivide(100, by: divisor).get()
}
```

---
id: errors-quiz
title: "Quiz: errors"
type: quiz
minutes: 4
---
# --description--

Five questions on errors.

# --questions--

## What must you write before calling a function marked `throws`?
- [ ] `catch`
- [x] `try`
- [ ] `throw`
Why: `try` marks each call that can fail.

## What does `try? riskyThing()` give if it throws?
- [ ] A crash
- [x] `nil`
- [ ] The error
Why: `try?` turns any error into `nil`.

## What does `throws(ParseError)` add over plain `throws`?
- [x] Callers know exactly which error type can be thrown, so they can switch over it completely
- [ ] It makes the function faster
- [ ] It means the function never throws
Why: That is typed throws.

## When does a `defer` block run?
- [ ] Immediately
- [ ] Only if an error is thrown
- [x] When the scope ends, whether normally, by returning, or by throwing
Why: It is for clean-up that must always happen.

## Which is the best fit for a missing middle name: an optional or an error?
- [x] An optional: nothing went wrong, there is just no value
- [ ] An error
- [ ] Both
Why: Errors explain failures; optionals represent values that may simply be absent.
