---
id: optionals-intro
title: What optionals are
type: lesson
minutes: 9
---
# --description--

Sometimes a value is simply not there. A person may have no middle name. Text typed into a form may not be a number. A dictionary may not have the key you asked for.

Many languages use a special "null" value for this, and programs crash when they forget to check for it. Swift's answer is the **optional**: a type that says "either a value, or nothing", where nothing is written `nil`.

You make a type optional by adding `?`:

```swift
var middleName: String? = nil   // no middle name yet
middleName = "Marie"            // now there is one
```

`String?` and `String` are different types. A `String` is always text. A `String?` might be text or `nil`, and Swift will not let you use it as text until you have checked. That check is what prevents the crashes.

You have already met optionals without knowing it:

```swift
let maybeNumber = Int("42")     // Int?: 42
let notNumber = Int("forty")    // Int?: nil
let first = [Int]().first       // Int?: nil, the array is empty
```

`Int("42")` gives an `Int?`, because not every piece of text is a number.

Printing an optional shows it wrapped, like `Optional(42)`, which is a reminder that you have not looked inside yet. The next lessons show how to look inside safely.

# --instructions--

1. Create a variable `nickname` of type `String?` that starts as `nil`.
2. Create a constant `parsed` from `Int("2026")`.
3. Create a constant `failed` from `Int("twenty")`.

# --tests--

`nickname` should be a `String?` that is `nil`.

```swift
expect(type(of: nickname) == Optional<String>.self && nickname == nil)
```

`parsed` should be `2026`.

```swift
expect(parsed == 2026)
```

`failed` should be `nil`.

```swift
expect(failed == nil)
```

You should declare `nickname` with `var` and the type `String?`.

```source
var\s+nickname\s*:\s*String\?
```

# --seed--

```swift

```

# --solution--

```swift
var nickname: String? = nil
let parsed = Int("2026")
let failed = Int("twenty")
```

---
id: optionals-if-let
title: Unwrapping with if let
type: lesson
minutes: 9
---
# --description--

To use the value inside an optional, you **unwrap** it. The everyday way is `if let`:

```swift
let input = "42"
if let number = Int(input) {
    print("Doubled: \(number * 2)")   // number is a plain Int here
} else {
    print("That's not a number.")
}
```

`if let` checks for a value. If there is one, it binds it to a new constant, without the `?`, which you can use inside the braces. If there is not, the `else` branch runs.

When the unwrapped value can have the same name as the optional, there is a shorter form:

```swift
var nickname: String? = "Ace"
if let nickname {
    print("Hi, \(nickname)")   // a plain String inside
}
```

You can unwrap several optionals at once, and add conditions, separated by commas. Everything must succeed for the body to run:

```swift
if let width = Int("40"), let height = Int("30"), width > 0 {
    print(width * height)
}
```

# --instructions--

Write `describe(_:)`, which takes an `Int?` age and returns:

- `"Age not given"` if it is `nil`,
- `"Age <n>"` otherwise, like `"Age 34"`.

Use `if let`.

# --tests--

`describe(34)` should return `"Age 34"`.

```swift
expect(describe(34) == "Age 34")
```

`describe(nil)` should return `"Age not given"`.

```swift
expect(describe(nil) == "Age not given")
```

You should use `if let`.

```source
if\s+let\s+
```

# --seed--

```swift
func describe(_ age: Int?) -> String {

}
```

# --solution--

```swift
func describe(_ age: Int?) -> String {
    if let age {
        return "Age \(age)"
    } else {
        return "Age not given"
    }
}
```

---
id: optionals-guard-let
title: Unwrapping with guard let
type: lesson
minutes: 9
---
# --description--

`guard let` unwraps an optional and, if it is `nil`, leaves straight away. If it succeeds, the unwrapped value stays available for the **rest of the function**, not just inside braces:

```swift
func greet(_ name: String?) -> String {
    guard let name else {
        return "Hello, stranger."
    }
    return "Hello, \(name)."   // name is a plain String from here on
}
```

Use `guard let` when the function cannot do its real work without the value. Use `if let` when the value is a nice extra.

Functions that might not be able to produce a result often return an optional themselves:

```swift
func firstWord(of text: String) -> String? {
    guard let word = text.split(separator: " ").first else { return nil }
    return String(word)
}
```

# --instructions--

Write `parseAge(_:)`, which takes a `String` and returns an `Int?`:

- If the text is not a whole number, return `nil`.
- If the number is below `0` or above `130`, return `nil`.
- Otherwise return the number.

Use `guard let` to turn the text into a number.

# --tests--

`parseAge("42")` should return `42`.

```swift
expect(parseAge("42") == 42)
```

`parseAge("forty")` should return `nil`.

```swift
expect(parseAge("forty") == nil)
```

`parseAge("-3")` and `parseAge("200")` should return `nil`.

```swift
expect(parseAge("-3") == nil && parseAge("200") == nil)
```

You should use `guard let`.

```source
guard\s+let\s+
```

# --seed--

```swift
func parseAge(_ text: String) -> Int? {

}
```

# --solution--

```swift
func parseAge(_ text: String) -> Int? {
    guard let age = Int(text), age >= 0, age <= 130 else {
        return nil
    }
    return age
}
```

---
id: optionals-defaults-chaining
title: Defaults and optional chaining
type: lesson
minutes: 9
---
# --description--

## Nil-coalescing: ??

`??` unwraps an optional or uses a fallback if it is `nil`. The result is never optional:

```swift
let saved: Int? = nil
let volume = saved ?? 50     // 50, a plain Int
```

You can chain them to try several sources in order:

```swift
let theme = userTheme ?? teamTheme ?? "light"
```

## Optional chaining: ?.

If you want something **from** an optional, put `?` before the dot. If the optional is `nil`, the whole expression quietly becomes `nil` instead of crashing:

```swift
let nickname: String? = "Ace"
let length = nickname?.count       // Int?: 3
let shout = nickname?.uppercased() // String?: "ACE"
```

Because the result is still optional, chaining pairs naturally with `??`:

```swift
let letters = nickname?.count ?? 0
```

# --instructions--

`settings` is a dictionary of optional preferences.

1. Create `fontSize`: the value of `settings["fontSize"]` turned into an `Int` with `Int(...)`, or `14` if either step fails. Use `flatMap` like this: `settings["fontSize"].flatMap { Int($0) }`, or `if let`.
2. Create `nameLength`: the number of characters in `settings["name"]`, or `0` if there is no name, using `?.` and `??`.

# --tests--

`fontSize` should be `18`.

```swift
expect(fontSize == 18)
```

`nameLength` should be `0`, because there is no `"name"`.

```swift
expect(nameLength == 0)
```

You should use optional chaining and `??`.

```source
\?\.count\s*\?\?\s*0
```

# --seed--

```swift
let settings = ["fontSize": "18", "theme": "dark"]

```

# --solution--

```swift
let settings = ["fontSize": "18", "theme": "dark"]
let fontSize = settings["fontSize"].flatMap { Int($0) } ?? 14
let nameLength = settings["name"]?.count ?? 0
```

---
id: optionals-force
title: Force unwrapping, and why to avoid it
type: lesson
minutes: 8
---
# --description--

There is one more way to unwrap: `!`, the **force unwrap**. It says "I am certain there is a value. Give it to me."

```swift
let number = Int("42")!   // 42
```

If you are wrong, the program crashes on the spot:

```swift
let oops = Int("forty")!   // Fatal error: Unexpectedly found nil
```

Every `!` is a promise to Swift that it cannot check. Experienced Swift programmers keep them rare and only use one when a `nil` would mean a bug in their own code, never because of what a user typed or a server sent. Even then, a message makes the crash easier to understand:

```swift
guard let url = URL(string: "https://asteria.technology") else {
    fatalError("Our own URL is wrong")
}
```

When in doubt, use `if let`, `guard let` or `??`.

# --instructions--

The program below crashes, because one of the inputs is not a number. Rewrite it without any `!` so that:

- `total` adds up only the inputs that are valid numbers, and
- `invalid` counts the inputs that are not.

# --tests--

`total` should be `60`.

```swift
expect(total == 60)
```

`invalid` should be `1`.

```swift
expect(invalid == 1)
```

Your code should not force unwrap.

```!source
\)!|\w!\s*(\+|$|\))
```

# --seed--

```swift
let inputs = ["10", "20", "x", "30"]
var total = 0
var invalid = 0

for text in inputs {
    total += Int(text)!
}
```

# --solution--

```swift
let inputs = ["10", "20", "x", "30"]
var total = 0
var invalid = 0

for text in inputs {
    if let value = Int(text) {
        total += value
    } else {
        invalid += 1
    }
}
```

---
id: optionals-lab-form
title: "Lab: checking a sign-up form"
type: lab
minutes: 15
---
# --description--

A sign-up form arrives as a dictionary of text fields. Some may be missing, and some may be filled in wrongly. Your job is to check it and build a clean result, using everything you know about optionals.

# --instructions--

Write `signUp(_:)`, which takes a `[String: String]` and returns a `String?`:

- `"name"` must be present and not empty after trimming spaces. Use `text.trimmingCharacters(in: .whitespaces)`, which needs `import Foundation` at the top of your code.
- `"age"` must be present and be a whole number of at least `13`.
- `"email"` must be present and contain `"@"`.
- If anything is wrong, return `nil`.
- Otherwise return `"<name> (<age>) <email>"`, using the trimmed name, like `"Ana (29) ana@example.com"`.

# --tests--

A good form should give `"Ana (29) ana@example.com"`.

```swift
expect(signUp(["name": " Ana ", "age": "29", "email": "ana@example.com"]) == "Ana (29) ana@example.com")
```

A missing name, or a name of only spaces, should give `nil`.

```swift
expect(signUp(["age": "29", "email": "a@b.c"]) == nil && signUp(["name": "   ", "age": "29", "email": "a@b.c"]) == nil)
```

An age that is not a number, or under 13, should give `nil`.

```swift
expect(signUp(["name": "Ben", "age": "ten", "email": "b@c.d"]) == nil && signUp(["name": "Ben", "age": "12", "email": "b@c.d"]) == nil)
```

An email without `@` should give `nil`.

```swift
expect(signUp(["name": "Ben", "age": "40", "email": "ben.example.com"]) == nil)
```

# --seed--

```swift
import Foundation

func signUp(_ form: [String: String]) -> String? {

}
```

# --solution--

```swift
import Foundation

func signUp(_ form: [String: String]) -> String? {
    guard let rawName = form["name"] else { return nil }
    let name = rawName.trimmingCharacters(in: .whitespaces)
    guard !name.isEmpty,
          let age = form["age"].flatMap({ Int($0) }), age >= 13,
          let email = form["email"], email.contains("@")
    else { return nil }
    return "\(name) (\(age)) \(email)"
}
```

# --hints--

- One `guard` can check several things at once, separated by commas.

---
id: optionals-quiz
title: "Quiz: optionals"
type: quiz
minutes: 4
---
# --description--

Five questions on optionals.

# --questions--

## What is the type of `Int("12")`?
- [ ] `Int`
- [x] `Int?`
- [ ] `String`
Why: Not all text is a number, so the conversion gives an optional.

## What does `nickname ?? "friend"` give when `nickname` is `nil`?
- [x] `"friend"`
- [ ] `nil`
- [ ] A crash
Why: `??` falls back to the value on its right when the left side is `nil`.

## What is `name?.count` when `name` is `"Ana"`?
- [ ] `3`
- [x] `Optional(3)`, an `Int?`
- [ ] `nil`
Why: Optional chaining always produces an optional, even when there is a value.

## When should you choose `guard let` over `if let`?
- [x] When the function cannot do its main job without the value
- [ ] Whenever there are two optionals
- [ ] Never: they are the same
Why: `guard let` leaves early and keeps the unwrapped value for the rest of the function.

## What happens when you force unwrap `nil` with `!`?
- [ ] You get a default value
- [ ] Nothing
- [x] The program crashes
Why: `!` promises a value is there. If it is not, Swift stops the program.
