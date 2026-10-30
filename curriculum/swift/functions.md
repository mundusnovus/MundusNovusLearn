---
id: functions-basics
title: Writing functions
type: lesson
minutes: 9
---
# --description--

A **function** is a named piece of code you can run whenever you need it. You have been calling `print` all along. Now you will write your own.

```swift
func sayHello() {
    print("Hello!")
}

sayHello()   // Hello!
```

`func` starts the function, then comes its name and parentheses, then its body in braces. Defining a function does not run it; calling it with `sayHello()` does.

Functions become useful when they take **parameters** (inputs) and **return** a result (output):

```swift
func square(number: Int) -> Int {
    return number * number
}

let nine = square(number: 3)
```

`number: Int` is a parameter: a name and a type. `-> Int` says the function gives back an `Int`. `return` hands that value back to whoever called it, and ends the function.

When the body is a single expression, you can leave out `return`:

```swift
func square(number: Int) -> Int {
    number * number
}
```

Good functions do one job and have a name that says what that job is. If you find yourself copying the same few lines, it is time for a function.

# --instructions--

Write a function `greeting(name:)` that takes a `String` and returns `"Hello, <name>!"`. For example, `greeting(name: "Lin")` returns `"Hello, Lin!"`.

Then print `greeting(name: "Swift")`.

# --tests--

`greeting(name: "Lin")` should return `"Hello, Lin!"`.

```swift
expect(greeting(name: "Lin") == "Hello, Lin!")
```

`greeting(name: "Ada")` should return `"Hello, Ada!"`.

```swift
expect(greeting(name: "Ada") == "Hello, Ada!")
```

Your program should print `Hello, Swift!`.

```output
^Hello, Swift!$
```

# --seed--

```swift

```

# --solution--

```swift
func greeting(name: String) -> String {
    "Hello, \(name)!"
}

print(greeting(name: "Swift"))
```

---
id: functions-labels
title: Argument labels
type: lesson
minutes: 9
---
# --description--

Swift functions read like sentences when you call them. That is thanks to **argument labels**.

Each parameter can have two names: a label used when **calling** the function, and a name used **inside** it.

```swift
func move(from start: Int, to end: Int) -> Int {
    end - start
}

move(from: 3, to: 10)   // 7
```

Outside, the call reads "move from 3 to 10". Inside, the code uses the clearer `start` and `end`.

If you give a parameter one name, it is used for both. If you do not want a label at all, write `_`:

```swift
func double(_ n: Int) -> Int { n * 2 }
double(21)   // no label needed: it reads naturally
```

Apple's own APIs follow these habits, and you will see them everywhere:

- Leave the first label out when the function name already says what it is: `names.append("Ana")`, not `append(item:)`.
- Use prepositions to make calls read well: `insert("Ana", at: 0)`, `distance(from: a, to: b)`.

# --instructions--

Write a function `distance(from:to:)` that takes two `Int` parameters and returns how far apart they are, always as a positive number. Inside the function, call the parameters `a` and `b`.

For example, `distance(from: 3, to: 10)` and `distance(from: 10, to: 3)` both return `7`.

# --tests--

`distance(from: 3, to: 10)` should return `7`.

```swift
expect(distance(from: 3, to: 10) == 7)
```

`distance(from: 10, to: 3)` should also return `7`.

```swift
expect(distance(from: 10, to: 3) == 7)
```

The parameters should have the labels `from` and `to`, and the names `a` and `b`.

```source
func\s+distance\s*\(\s*from\s+a\s*:\s*Int\s*,\s*to\s+b\s*:\s*Int\s*\)
```

# --seed--

```swift

```

# --solution--

```swift
func distance(from a: Int, to b: Int) -> Int {
    abs(b - a)
}
```

# --hints--

- `abs(x)` gives the absolute value of `x`: it turns `-7` into `7`.

---
id: functions-defaults
title: Default values and variadic parameters
type: lesson
minutes: 9
---
# --description--

A parameter can have a **default value**. Callers can then leave it out:

```swift
func greet(_ name: String, with greeting: String = "Hello") -> String {
    "\(greeting), \(name)!"
}

greet("Ana")                      // "Hello, Ana!"
greet("Ana", with: "Good morning") // "Good morning, Ana!"
```

Default values keep calls short for the common case while still allowing the unusual one. `print` uses them: it has hidden parameters `separator` and `terminator`, and `print("a", terminator: "")` prints without starting a new line.

A **variadic** parameter accepts any number of values, written with `...` after the type. Inside the function, it is an array:

```swift
func sum(_ numbers: Int...) -> Int {
    var total = 0
    for n in numbers { total += n }
    return total
}

sum(1, 2, 3)   // 6
sum()          // 0
```

# --instructions--

1. Write `average(_:)`, which takes any number of `Double` values and returns their average. If there are none, return `0`.
2. Write `price(_:discount:)`, which takes a `Double` price and a `Double` discount that defaults to `0.1`, and returns the price after the discount. `price(50)` returns `45.0`, and `price(50, discount: 0.5)` returns `25.0`.

# --tests--

`average(2, 4, 9)` should return `5.0`.

```swift
expect(average(2, 4, 9) == 5.0)
```

`average()` should return `0.0`.

```swift
expect(average() == 0.0)
```

`price(50)` should return `45.0`.

```swift
expect(abs(price(50) - 45.0) < 0.0001)
```

`price(50, discount: 0.5)` should return `25.0`.

```swift
expect(abs(price(50, discount: 0.5) - 25.0) < 0.0001)
```

# --seed--

```swift

```

# --solution--

```swift
func average(_ numbers: Double...) -> Double {
    if numbers.isEmpty { return 0 }
    var total = 0.0
    for n in numbers { total += n }
    return total / Double(numbers.count)
}

func price(_ amount: Double, discount: Double = 0.1) -> Double {
    amount * (1 - discount)
}
```

---
id: functions-tuples
title: Returning several values
type: lesson
minutes: 8
---
# --description--

A function returns one value, but that value can be a tuple. This is how to give back several related results at once:

```swift
func split(_ fullName: String) -> (first: String, last: String) {
    let parts = fullName.split(separator: " ")
    return (String(parts[0]), String(parts[1]))
}

let name = split("Grace Hopper")
name.first   // "Grace"
name.last    // "Hopper"
```

Because the tuple's parts are named in the return type, callers can use those names. They can also destructure the result:

```swift
let (first, last) = split("Alan Turing")
```

# --instructions--

Write `stats(_:)`, which takes an array of `Int` and returns a tuple `(min: Int, max: Int, total: Int)`. You can assume the array is not empty.

For `[4, 9, 1, 7]` it returns `(min: 1, max: 9, total: 21)`.

# --tests--

`stats([4, 9, 1, 7])` should have `min` 1, `max` 9 and `total` 21.

```swift
let s = stats([4, 9, 1, 7])
expect(s.min == 1 && s.max == 9 && s.total == 21)
```

`stats([5])` should have `min` 5, `max` 5 and `total` 5.

```swift
let s = stats([5])
expect(s.min == 5 && s.max == 5 && s.total == 5)
```

# --seed--

```swift

```

# --solution--

```swift
func stats(_ numbers: [Int]) -> (min: Int, max: Int, total: Int) {
    var low = numbers[0], high = numbers[0], sum = 0
    for n in numbers {
        if n < low { low = n }
        if n > high { high = n }
        sum += n
    }
    return (low, high, sum)
}
```

---
id: functions-inout-guard
title: guard and inout
type: lesson
minutes: 10
---
# --description--

## guard: leave early

`guard` checks that something is true, and if it is not, leaves straight away. Its `else` block must exit, usually with `return`:

```swift
func ticketPrice(age: Int) -> Int {
    guard age >= 0 else { return 0 }
    guard age >= 12 else { return 5 }
    return 10
}
```

`guard` keeps the main path of a function flush with the left edge, with problems handled at the top. Compare that with a pile of nested `if` statements, and you will see why Swift programmers love it. You will use it even more with optionals in the next module.

## inout: change the caller's variable

Parameters are constants: a function cannot change what it is given. If a function really must change a variable that belongs to the caller, mark the parameter `inout`, and put `&` in front of the variable when calling:

```swift
func addBonus(to score: inout Int) {
    score += 100
}

var points = 50
addBonus(to: &points)   // points is now 150
```

The `&` makes the change visible at the call site. Use `inout` sparingly: returning a new value is usually clearer.

# --instructions--

1. Write `shipping(weight:)`, taking a `Double` weight in kilograms and returning an `Int` cost. Use `guard` to return `0` for a weight of `0` or less. Otherwise it costs `5`, plus `2` more if the weight is over `10`.
2. Write `clamp(_:)` with an `inout Int` parameter that changes the value so it is never below `0` or above `100`.

# --tests--

`shipping(weight: -1)` and `shipping(weight: 0)` should return `0`.

```swift
expect(shipping(weight: -1) == 0 && shipping(weight: 0) == 0)
```

`shipping(weight: 3)` should return `5`, and `shipping(weight: 12)` should return `7`.

```swift
expect(shipping(weight: 3) == 5 && shipping(weight: 12) == 7)
```

You should use `guard` in `shipping`.

```source
guard\s+weight
```

`clamp` should change `120` to `100`, `-5` to `0`, and leave `40` alone.

```swift
var a = 120, b = -5, c = 40
clamp(&a); clamp(&b); clamp(&c)
expect(a == 100 && b == 0 && c == 40)
```

# --seed--

```swift

```

# --solution--

```swift
func shipping(weight: Double) -> Int {
    guard weight > 0 else { return 0 }
    return weight > 10 ? 7 : 5
}

func clamp(_ value: inout Int) {
    value = min(max(value, 0), 100)
}
```

---
id: functions-lab-password
title: "Lab: a password checker"
type: lab
minutes: 15
---
# --description--

Write a small library of functions that checks how strong a password is. Each rule is its own function, and one function brings them together.

Useful tools: `password.count`, and looping over a string gives you each `Character`, which has properties like `isNumber`, `isUppercase` and `isLetter`.

```swift
for character in "aB3" {
    print(character.isNumber)   // false, false, true
}
```

# --instructions--

Write these functions, each taking a `String` and returning a `Bool`:

1. `isLongEnough(_:)`: at least 12 characters.
2. `hasNumber(_:)`: contains at least one digit.
3. `hasUppercase(_:)`: contains at least one capital letter.

Then write `strength(of:)`, which returns a `String`:

- `"strong"` if all three rules pass,
- `"okay"` if exactly two pass,
- `"weak"` otherwise.

# --tests--

`isLongEnough` should need 12 or more characters.

```swift
expect(isLongEnough("abcdefghijkl") && !isLongEnough("abcdefghijk"))
```

`hasNumber` should spot a digit.

```swift
expect(hasNumber("abc1") && !hasNumber("abc"))
```

`hasUppercase` should spot a capital letter.

```swift
expect(hasUppercase("abC") && !hasUppercase("abc"))
```

`strength(of: "CorrectHorse42")` should be `"strong"`.

```swift
expect(strength(of: "CorrectHorse42") == "strong")
```

`strength(of: "correcthorse42")` should be `"okay"`, and `strength(of: "pass")` should be `"weak"`.

```swift
expect(strength(of: "correcthorse42") == "okay" && strength(of: "pass") == "weak")
```

# --seed--

```swift

```

# --solution--

```swift
func isLongEnough(_ password: String) -> Bool {
    password.count >= 12
}

func hasNumber(_ password: String) -> Bool {
    for character in password where character.isNumber { return true }
    return false
}

func hasUppercase(_ password: String) -> Bool {
    for character in password where character.isUppercase { return true }
    return false
}

func strength(of password: String) -> String {
    var passed = 0
    if isLongEnough(password) { passed += 1 }
    if hasNumber(password) { passed += 1 }
    if hasUppercase(password) { passed += 1 }
    switch passed {
    case 3: return "strong"
    case 2: return "okay"
    default: return "weak"
    }
}
```

# --hints--

- Count how many rules pass with a variable, then `switch` on the count.

---
id: functions-quiz
title: "Quiz: functions"
type: quiz
minutes: 4
---
# --description--

Five questions on functions.

# --questions--

## How do you call `func area(width w: Double, height h: Double) -> Double`?
- [ ] `area(w: 3, h: 4)`
- [x] `area(width: 3, height: 4)`
- [ ] `area(3, 4)`
Why: Callers use the argument labels `width` and `height`; `w` and `h` are only used inside the function.

## What does `_` mean in `func double(_ n: Int)`?
- [x] There is no argument label, so you call it `double(4)`
- [ ] The parameter is ignored
- [ ] The parameter is optional
Why: `_` removes the label.

## What must a `guard … else { }` block do?
- [x] Leave the current scope, for example with `return`
- [ ] Print an error
- [ ] Run the rest of the function
Why: `guard` is for early exits, so Swift requires the `else` block to leave.

## What is the type of `numbers` inside `func sum(_ numbers: Int...)`?
- [ ] `Int`
- [x] `[Int]`
- [ ] `(Int, Int)`
Why: A variadic parameter arrives as an array.

## When is `inout` the right choice?
- [ ] Whenever a function needs a parameter
- [x] Rarely: when a function must change a variable that belongs to its caller
- [ ] Whenever a function returns more than one value
Why: Returning a new value is usually clearer; `inout` is for the few cases where changing in place is the point.
