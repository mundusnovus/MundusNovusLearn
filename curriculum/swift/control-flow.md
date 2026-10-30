---
id: control-if
title: Decisions with if
type: lesson
minutes: 9
---
# --description--

`if` runs code only when a condition is `true`:

```swift
let temperature = 31
if temperature > 30 {
    print("It's hot. Drink water.")
}
```

The condition must be a `Bool`. Swift does not treat numbers as true or false, so `if count { }` is an error; write `if count > 0 { }`.

Add `else` for the other case, and `else if` to test more conditions in order. Swift takes the **first** branch whose condition is true and skips the rest:

```swift
let hour = 15
if hour < 12 {
    print("Good morning")
} else if hour < 18 {
    print("Good afternoon")
} else {
    print("Good evening")
}
```

When you only need to choose between two **values**, the **ternary operator** is a compact alternative: `condition ? valueIfTrue : valueIfFalse`.

```swift
let items = 1
let label = items == 1 ? "item" : "items"
print("\(items) \(label)")   // 1 item
```

Use it for short choices. When the logic grows, an `if` statement reads better.

# --instructions--

Set `grade` to a letter based on `score`:

- `90` or more: `"A"`
- `80` to `89`: `"B"`
- `70` to `79`: `"C"`
- below `70`: `"F"`

Declare `grade` as `let grade: String` without a value, then give it its value in each branch. Swift checks that every path gives it exactly one value.

# --tests--

With a score of `84`, `grade` should be `"B"`.

```swift
expect(grade == "B")
```

You should use `if` and `else if`.

```source
if\s+score[\s\S]*else\s+if
```

You should declare `grade` with `let`.

```source
let\s+grade\s*:\s*String
```

# --seed--

```swift
let score = 84
let grade: String

```

# --solution--

```swift
let score = 84
let grade: String

if score >= 90 {
    grade = "A"
} else if score >= 80 {
    grade = "B"
} else if score >= 70 {
    grade = "C"
} else {
    grade = "F"
}
```

# --hints--

- Test the highest band first. Because Swift takes the first true branch, `score >= 80` then only catches 80 to 89.

---
id: control-switch
title: Choosing with switch
type: lesson
minutes: 10
---
# --description--

`switch` compares one value against several **cases**, and runs the first that matches:

```swift
let day = "Sat"
switch day {
case "Sat", "Sun":
    print("Weekend")
case "Fri":
    print("Almost there")
default:
    print("Weekday")
}
```

A few things make Swift's `switch` special:

- **It must be exhaustive.** Every possible value has to be handled. For strings and numbers that means a `default` case.
- **No fall-through.** Only the matching case runs, so there is no `break` to forget.
- **Cases can match more than one value**, separated by commas.
- **Cases can match ranges and conditions:**

```swift
let speed = 72
switch speed {
case 0:
    print("Stopped")
case 1..<30:
    print("Slow")
case 30...70:
    print("Normal")
case let s where s > 120:
    print("Dangerous: \(s)")
default:
    print("Fast")
}
```

`1..<30` means 1 up to but not including 30. `30...70` includes both ends. `case let s where …` binds the value to a name and adds a condition.

`switch` can also give a value directly, which keeps things tidy:

```swift
let label = switch speed {
case 0: "Stopped"
case 1..<30: "Slow"
default: "Moving"
}
```

# --instructions--

Use a `switch` on `month` (1 to 12) to set `season`, for the northern hemisphere:

- `12`, `1`, `2`: `"Winter"`
- `3`, `4`, `5`: `"Spring"`
- `6`, `7`, `8`: `"Summer"`
- `9`, `10`, `11`: `"Autumn"`
- anything else: `"Unknown"`

# --tests--

With `month` set to `10`, `season` should be `"Autumn"`.

```swift
expect(season == "Autumn")
```

You should use a `switch` on `month`.

```source
switch\s+month
```

You should handle values outside 1 to 12 with `default`.

```source
default\s*:
```

# --seed--

```swift
let month = 10

```

# --solution--

```swift
let month = 10

let season = switch month {
case 12, 1, 2: "Winter"
case 3...5: "Spring"
case 6...8: "Summer"
case 9...11: "Autumn"
default: "Unknown"
}
```

---
id: control-for
title: Loops with for-in
type: lesson
minutes: 10
---
# --description--

A `for-in` loop runs its body once for each item in a sequence:

```swift
let names = ["Ana", "Ben", "Cleo"]
for name in names {
    print("Hello, \(name)!")
}
```

Ranges are sequences too, so you can loop over numbers:

```swift
for n in 1...3 {
    print(n)          // 1, 2, 3
}
for i in 0..<names.count {
    print(i)          // 0, 1, 2
}
```

If you need both the position and the item, use `enumerated()`:

```swift
for (index, name) in names.enumerated() {
    print("\(index + 1). \(name)")
}
```

To count in steps, use `stride`:

```swift
for t in stride(from: 10, through: 0, by: -5) {
    print(t)          // 10, 5, 0
}
```

Looping over a dictionary gives you each key and value as a tuple:

```swift
for (country, capital) in ["Peru": "Lima"] {
    print("\(capital) is the capital of \(country)")
}
```

If you do not need the loop value at all, write `_` instead of a name: `for _ in 1...3 { print("Hip hip hooray!") }`.

# --instructions--

1. Create `total`: the sum of every whole number from `1` to `100`, worked out with a `for-in` loop.
2. Create `evens`: an array of the even numbers from `2` to `20`, built with a loop.

# --tests--

`total` should be `5050`.

```swift
expect(total == 5050)
```

`evens` should be `[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]`.

```swift
expect(evens == [2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
```

You should use `for-in` loops.

```source
for\s+\w+\s+in[\s\S]*for\s+\w+\s+in
```

# --seed--

```swift
var total = 0
var evens: [Int] = []

```

# --solution--

```swift
var total = 0
var evens: [Int] = []

for n in 1...100 {
    total += n
}

for n in stride(from: 2, through: 20, by: 2) {
    evens.append(n)
}
```

---
id: control-while
title: while, break and continue
type: lesson
minutes: 9
---
# --description--

A `for-in` loop is right when you know what you are looping over. When you only know **when to stop**, use `while`. It checks its condition before each pass:

```swift
var balance = 100.0
var years = 0
while balance < 200 {
    balance *= 1.07
    years += 1
}
print("Doubled in \(years) years")
```

`repeat-while` checks **after** each pass, so its body always runs at least once:

```swift
var roll = 0
repeat {
    roll = Int.random(in: 1...6)
} while roll != 6
```

Two keywords steer any loop:

- `continue` skips the rest of this pass and moves to the next.
- `break` leaves the loop completely.

```swift
for n in 1...10 {
    if n % 2 == 0 { continue }   // skip even numbers
    if n > 7 { break }           // stop after 7
    print(n)                     // 1, 3, 5, 7
}
```

> **Warning** A `while` loop whose condition never becomes false runs forever. Here, a program that runs too long is stopped after a few seconds, and you will see a message saying so.

# --instructions--

Starting from `1`, keep doubling `value` until it is more than `1000`. Count how many doublings that takes in `doublings`.

Then fill `firstSquareOver50` with the first square number (1, 4, 9, 16, …) that is greater than `50`, using a loop with `break`.

# --tests--

`value` should be `1024`.

```swift
expect(value == 1024)
```

`doublings` should be `10`.

```swift
expect(doublings == 10)
```

`firstSquareOver50` should be `64`.

```swift
expect(firstSquareOver50 == 64)
```

You should use `while` and `break`.

```source
while[\s\S]*break|break[\s\S]*while
```

# --seed--

```swift
var value = 1
var doublings = 0
var firstSquareOver50 = 0

```

# --solution--

```swift
var value = 1
var doublings = 0
var firstSquareOver50 = 0

while value <= 1000 {
    value *= 2
    doublings += 1
}

for n in 1... {
    if n * n > 50 {
        firstSquareOver50 = n * n
        break
    }
}
```

# --hints--

- `for n in 1...` is a range with no end. It is safe here because `break` stops it.

---
id: control-lab-fizzbuzz
title: "Lab: FizzBuzz"
type: lab
minutes: 12
---
# --description--

FizzBuzz is a classic test of loops and conditions, and a favourite in job interviews. Now it is yours.

# --instructions--

Print the numbers from `1` to `30`, one per line, except:

- for multiples of `3`, print `Fizz` instead of the number,
- for multiples of `5`, print `Buzz`,
- for multiples of both `3` and `5`, print `FizzBuzz`.

# --tests--

The first five lines should be `1`, `2`, `Fizz`, `4`, `Buzz`.

```output
^1\n2\nFizz\n4\nBuzz\n
```

Line 15 should be `FizzBuzz`.

```output
\n14\nFizzBuzz\n16\n
```

The last line should be `FizzBuzz` (for 30), and there should be exactly 30 lines.

```output
^(?:[^\n]*\n){29}FizzBuzz$
```

You should use a loop.

```source
for\s|while\s
```

# --seed--

```swift

```

# --solution--

```swift
for n in 1...30 {
    if n % 15 == 0 {
        print("FizzBuzz")
    } else if n % 3 == 0 {
        print("Fizz")
    } else if n % 5 == 0 {
        print("Buzz")
    } else {
        print(n)
    }
}
```

# --hints--

- Check "both" first. Otherwise a multiple of 15 is caught by the "multiple of 3" branch.
- `n % 3 == 0` is true when `n` divides by 3 exactly.

---
id: control-quiz
title: "Quiz: decisions and loops"
type: quiz
minutes: 4
---
# --description--

Five questions on `if`, `switch` and loops.

# --questions--

## What does this print?

```swift
let x = 75
if x > 50 { print("big") } else if x > 70 { print("bigger") }
```
- [x] `big`
- [ ] `bigger`
- [ ] `big` and then `bigger`
Why: Swift runs the first branch whose condition is true and skips the rest.

## Why does Swift's `switch` on a `String` need a `default` case?
- [ ] To catch mistakes in the case values
- [x] Because a `switch` must handle every possible value
- [ ] Because otherwise every case runs
Why: Switches must be exhaustive. There are endless possible strings, so `default` covers the rest.

## What values does `for i in 0..<3` give?
- [x] `0, 1, 2`
- [ ] `0, 1, 2, 3`
- [ ] `1, 2, 3`
Why: `..<` goes up to, but not including, the end.

## When does a `repeat-while` loop check its condition?
- [ ] Before each pass
- [x] After each pass, so the body runs at least once
- [ ] Only once, at the start
Why: `while` checks first; `repeat-while` checks after.

## What does `continue` do inside a loop?
- [ ] Ends the loop
- [x] Skips the rest of this pass and starts the next
- [ ] Restarts the loop from the beginning
Why: `break` ends the loop; `continue` moves on to the next pass.
