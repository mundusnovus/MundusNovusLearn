---
id: values-constants
title: Constants with let
type: lesson
minutes: 6
---
# --description--

Programs work with **values**: numbers, text, true-or-false answers. To use a value more than once, you give it a name.

In Swift you name a value with `let`:

```swift
let city = "Lisbon"
print(city)
```

This makes a **constant** called `city` that holds the text `"Lisbon"`. Wherever you write `city` afterwards, Swift uses its value.

A constant can never change. If you try, Swift refuses to build your program:

```swift
let city = "Lisbon"
city = "Porto" // error: cannot assign to value: 'city' is a 'let' constant
```

That sounds strict, but it is one of Swift's best habits. Most values in a program are set once and never change. Saying so with `let` makes your code easier to trust, and Swift tells you straight away if you change something by mistake.

**Naming:** Swift names use `camelCase`: start with a small letter, and start each following word with a capital, like `firstName` or `numberOfGuests`. Choose names that say what the value means.

# --instructions--

Create a constant called `language` that holds the text `"Swift"`, then print it.

# --tests--

You should declare `language` with `let`.

```source
\blet\s+language\b
```

`language` should be `"Swift"`.

```swift
expect(language == "Swift")
```

Your program should print `Swift`.

```output
^Swift$
```

# --seed--

```swift
// Create your constant below

```

# --solution--

```swift
let language = "Swift"
print(language)
```

# --hints--

- Write `let`, then the name, then `=`, then the value in double quotes.
- Then pass the name to `print`, without quotes: `print(language)`.

---
id: values-variables
title: Variables with var
type: lesson
minutes: 6
---
# --description--

Some values do need to change: a score in a game, the number of items in a basket. For those, use `var` to make a **variable**:

```swift
var lives = 3
lives = 2
print(lives) // 2
```

The first line creates the variable and gives it a starting value. The second line gives it a new value. From then on, `lives` is `2`.

You can use a variable's current value to work out its next one:

```swift
var steps = 100
steps = steps + 50   // 150
steps += 50          // 200: a shorter way to write the same thing
steps -= 25          // 175
```

`+=` adds to a variable, `-=` subtracts from it.

**Which should you use?** Start with `let`. Change to `var` only when the value really has to change. If you write `var` and never change the value, Swift gives you a gentle warning suggesting `let`.

# --instructions--

Create a variable called `score` that starts at `0`. Then add `10` to it, then add `5` more, and print it. The program should print `15`.

# --tests--

You should declare `score` with `var`.

```source
\bvar\s+score\b
```

`score` should end up as `15`.

```swift
expect(score == 15)
```

You should change `score` after creating it, using `+=` or `=`.

```source
score\s*(\+=|=\s*score)
```

Your program should print `15`.

```output
^15$
```

# --seed--

```swift
var score = 0

```

# --solution--

```swift
var score = 0
score += 10
score += 5
print(score)
```

---
id: values-types
title: Types
type: lesson
minutes: 8
---
# --description--

Every value in Swift has a **type**, which says what kind of value it is and what you can do with it. The ones you will use every day are:

| Type | What it holds | Examples |
| --- | --- | --- |
| `Int` | Whole numbers | `42`, `-7`, `1_000_000` |
| `Double` | Numbers with a fractional part | `3.14`, `-0.5`, `2.0` |
| `String` | Text | `"Hello"`, `""` |
| `Bool` | True or false | `true`, `false` |

Usually you do not have to say the type. Swift works it out from the value. This is called **type inference**:

```swift
let year = 2026        // Int
let price = 4.99       // Double
let title = "Swift"    // String
let isOpen = true      // Bool
```

You can also write the type yourself, after a colon. This is a **type annotation**:

```swift
let year: Int = 2026
var temperature: Double = 21
```

Notice the second line: `21` on its own would be an `Int`, but the annotation tells Swift you want a `Double`, so it becomes `21.0`.

Once a name has a type, it keeps it. A `String` variable can only ever hold text. Swift checks this before your program runs, which is why a whole class of mistakes simply cannot happen in Swift.

# --instructions--

Create three constants, each with a type annotation:

- `year`, an `Int`, set to `2026`
- `temperature`, a `Double`, set to `18.5`
- `isLearning`, a `Bool`, set to `true`

# --tests--

`year` should be an `Int` equal to `2026`.

```swift
expect(type(of: year) == Int.self && year == 2026)
```

`temperature` should be a `Double` equal to `18.5`.

```swift
expect(type(of: temperature) == Double.self && temperature == 18.5)
```

`isLearning` should be a `Bool` equal to `true`.

```swift
expect(type(of: isLearning) == Bool.self && isLearning == true)
```

You should write each type yourself, with a colon.

```source
year\s*:\s*Int[\s\S]*temperature\s*:\s*Double[\s\S]*isLearning\s*:\s*Bool
```

# --seed--

```swift

```

# --solution--

```swift
let year: Int = 2026
let temperature: Double = 18.5
let isLearning: Bool = true
```

---
id: values-numbers
title: Working with numbers
type: lesson
minutes: 8
---
# --description--

Swift does arithmetic with the symbols you would expect:

```swift
let a = 7 + 3    // 10
let b = 7 - 3    // 4
let c = 7 * 3    // 21
let d = 7 / 3    // 2
let e = 7 % 3    // 1
```

Look closely at the last two. When both numbers are `Int`, division gives a whole number and drops anything after the point: `7 / 3` is `2`. The **remainder** operator `%` gives what is left over: `7 % 3` is `1`.

With `Double` you get the fractional part:

```swift
let f = 7.0 / 3.0   // 2.3333333333333335
```

Swift never mixes `Int` and `Double` silently. If you have one of each, convert one so they match:

```swift
let minutes = 90
let hours = Double(minutes) / 60   // 1.5
```

Integer division and remainder are a useful pair. They split a total into whole groups and what is left over, like turning minutes into hours and minutes.

# --instructions--

`totalMinutes` is `135`. Create two constants:

- `hours`: how many whole hours are in `totalMinutes`
- `minutes`: how many minutes are left over

Use `/` and `%` on `totalMinutes`. Then print them like this: `2 h 15 min`

# --tests--

`hours` should be `2`.

```swift
expect(hours == 2)
```

`minutes` should be `15`.

```swift
expect(minutes == 15)
```

You should work them out with `/` and `%`, not type the answers.

```source
totalMinutes\s*/\s*60[\s\S]*totalMinutes\s*%\s*60|totalMinutes\s*%\s*60[\s\S]*totalMinutes\s*/\s*60
```

Your program should print `2 h 15 min`.

```output
^2 h 15 min$
```

# --seed--

```swift
let totalMinutes = 135

```

# --solution--

```swift
let totalMinutes = 135
let hours = totalMinutes / 60
let minutes = totalMinutes % 60
print("\(hours) h \(minutes) min")
```

# --hints--

- There are 60 minutes in an hour, so `totalMinutes / 60` gives whole hours.
- To print several values on one line, you can write `print("\(hours) h \(minutes) min")`. The next lesson explains how that works.

---
id: values-strings
title: Strings and interpolation
type: lesson
minutes: 8
---
# --description--

A `String` is text. You can join strings with `+`:

```swift
let first = "Grace"
let last = "Hopper"
let full = first + " " + last   // "Grace Hopper"
```

Most of the time, though, you will use **string interpolation**. Write `\(` and `)` inside a string, and put any value or expression between them. Swift puts the value into the text:

```swift
let name = "Grace"
let year = 1906
print("\(name) was born in \(year).")
print("Next year is \(year + 1).")
```

Interpolation works with any type, not only strings, so you do not have to convert numbers first.

A few more useful things strings can do:

```swift
let word = "Swift"
word.count          // 5, the number of characters
word.uppercased()   // "SWIFT"
word.isEmpty        // false
word.hasPrefix("Sw") // true
```

For text over several lines, use three double quotes:

```swift
let poem = """
    Roses are red,
    Swift is fast.
    """
```

# --instructions--

Using `name` and `age`, create a constant called `intro` with the text `Ada is 36 years old.`, built with string interpolation. Then print `intro`.

# --tests--

`intro` should be `"Ada is 36 years old."`

```swift
expect(intro == "Ada is 36 years old.")
```

You should use string interpolation, not type the name and age again.

```source
\\\(\s*name\s*\)[\s\S]*\\\(\s*age\s*\)
```

Your program should print `Ada is 36 years old.`

```output
^Ada is 36 years old\.$
```

# --seed--

```swift
let name = "Ada"
let age = 36

```

# --solution--

```swift
let name = "Ada"
let age = 36
let intro = "\(name) is \(age) years old."
print(intro)
```

---
id: values-bools
title: True or false
type: lesson
minutes: 8
---
# --description--

A `Bool` is either `true` or `false`. You get one whenever you compare two values:

```swift
3 > 2      // true
3 == 4     // false: == means "is equal to"
3 != 4     // true:  != means "is not equal to"
"a" < "b"  // true: strings compare alphabetically
```

The comparison operators are `==`, `!=`, `<`, `>`, `<=` and `>=`. Be careful not to confuse `==` (compare) with `=` (assign).

You can combine `Bool` values:

| Operator | Meaning | Example |
| --- | --- | --- |
| `&&` | and: both must be true | `isSunny && isWeekend` |
| `\|\|` | or: at least one is true | `hasTicket \|\| isStaff` |
| `!` | not: flips true and false | `!isRaining` |

Parentheses make longer conditions clear:

```swift
let age = 16
let withAdult = true
let canEnter = age >= 18 || (age >= 12 && withAdult)  // true
```

# --instructions--

A person can drive if they are 18 or older, or if they are at least 16 **and** have a learner's permit. Using `age` and `hasPermit`, create a constant `canDrive` that is `true` exactly when the person can drive.

# --tests--

`canDrive` should be a `Bool`.

```swift
expect(type(of: canDrive) == Bool.self)
```

With `age` 17 and a permit, `canDrive` should be `true`.

```swift
expect(canDrive == true)
```

You should work `canDrive` out from `age` and `hasPermit`, with `||` and `&&`.

```source
canDrive\s*=.*age.*(\|\||&&).*hasPermit|canDrive\s*=.*hasPermit.*(\|\||&&).*age
```

# --seed--

```swift
let age = 17
let hasPermit = true

```

# --solution--

```swift
let age = 17
let hasPermit = true
let canDrive = age >= 18 || (age >= 16 && hasPermit)
```

---
id: values-convert
title: Converting between types
type: lesson
minutes: 7
---
# --description--

Because Swift never mixes types silently, you sometimes need to convert a value yourself. You do it by writing the type you want, with the value in parentheses:

```swift
let whole = 7
let decimal = Double(whole)   // 7.0
let rounded = Int(9.99)       // 9: converting to Int drops the fraction
let text = String(42)         // "42"
```

`Int(9.99)` cuts off the fraction instead of rounding. To round to the nearest whole number, round the `Double` first:

```swift
let r = Int(9.99.rounded())   // 10
```

The most common conversion is working out an average, which needs `Double` division even when the inputs are whole numbers:

```swift
let total = 17
let count = 4
let average = Double(total) / Double(count)   // 4.25
```

> **Note** Turning text into a number, like `Int("42")`, is different, because the text might not be a number at all. Swift handles that with *optionals*, which you will meet soon.

# --instructions--

Three test scores add up to `totalPoints`. Create a constant `average` with the exact average score as a `Double`, by converting `totalPoints` and `tests`.

# --tests--

`average` should be a `Double`.

```swift
expect(type(of: average) == Double.self)
```

`average` should be `85.5`.

```swift
expect(average == 85.5)
```

You should convert with `Double(...)`.

```source
Double\(\s*totalPoints\s*\)
```

# --seed--

```swift
let totalPoints = 171
let tests = 2

```

# --solution--

```swift
let totalPoints = 171
let tests = 2
let average = Double(totalPoints) / Double(tests)
```

---
id: values-lab-receipt
title: "Lab: a receipt"
type: lab
minutes: 15
---
# --description--

Time to put the module together. A café sells coffee at `price` each. A customer buys `quantity` cups, and tax is added at `taxRate` (`0.08` means 8%).

There are no step-by-step instructions in a lab: you have the requirements and the tests. If you get stuck, look back at the lessons.

# --instructions--

1. Create `subtotal`: the price of all the cups before tax.
2. Create `tax`: the tax on the subtotal.
3. Create `total`: the subtotal plus the tax.
4. Print three lines exactly like this:

```
Subtotal: 12.5
Tax: 1.0
Total: 13.5
```

Work every number out from `price`, `quantity` and `taxRate`, so the receipt would still be right if they changed.

# --tests--

`subtotal` should be `12.5`.

```swift
expect(abs(subtotal - 12.5) < 0.0001)
```

`tax` should be `1.0`.

```swift
expect(abs(tax - 1.0) < 0.0001)
```

`total` should be `13.5`.

```swift
expect(abs(total - 13.5) < 0.0001)
```

You should work the subtotal out from `price` and `quantity`.

```source
subtotal\s*=.*price.*quantity|subtotal\s*=.*quantity.*price
```

Your program should print the three receipt lines.

```output
^Subtotal: 12\.5\nTax: 1\.0\nTotal: 13\.5$
```

# --seed--

```swift
let price = 2.5
let quantity = 5
let taxRate = 0.08

```

# --solution--

```swift
let price = 2.5
let quantity = 5
let taxRate = 0.08

let subtotal = price * Double(quantity)
let tax = subtotal * taxRate
let total = subtotal + tax

print("Subtotal: \(subtotal)")
print("Tax: \(tax)")
print("Total: \(total)")
```

# --hints--

- `quantity` is an `Int` and `price` is a `Double`. Convert one so they match.
- Interpolation prints a `Double` like `12.5` or `1.0` for you.

---
id: values-quiz
title: "Quiz: values and types"
type: quiz
minutes: 4
---
# --description--

Five questions on values and types.

# --questions--

## Which line makes a value that can never change?
- [x] `let speed = 10`
- [ ] `var speed = 10`
- [ ] `speed = 10`
Why: `let` makes a constant. `var` makes a variable you can change.

## What is the type of `price` here?

```swift
let price = 4
```
- [x] `Int`
- [ ] `Double`
- [ ] `String`
Why: `4` has no fractional part, so Swift infers `Int`. Write `4.0` or `let price: Double = 4` for a `Double`.

## What is `17 / 5` when both are `Int`?
- [ ] `3.4`
- [x] `3`
- [ ] `4`
Why: Dividing two `Int` values gives a whole number and drops the fraction. `17 % 5` would give the remainder, `2`.

## What does this print?

```swift
let n = 3
print("n squared is \(n * n)")
```
- [ ] `n squared is n * n`
- [ ] `n squared is \(n * n)`
- [x] `n squared is 9`
Why: Anything inside `\(` and `)` in a string is worked out and put into the text.

## Which condition is `true` when `x` is between 1 and 10, including both?
- [x] `x >= 1 && x <= 10`
- [ ] `x >= 1 || x <= 10`
- [ ] `x > 1 && x < 10`
Why: Both parts must hold, so use `&&`. `>=` and `<=` include the end points.
