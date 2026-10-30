---
id: testing-why
title: Why we write tests
type: lesson
minutes: 6
---
# --description--

Every lesson on this site has been checked by tests: small pieces of code that run your code and check the answer. You have been on the receiving end of testing all along. Now you will write your own.

A test is code that says: "given this input, I expect that output." Once written, it checks your work in a second, forever. Tests let you change code without fear: if you break something, a test tells you straight away, long before anyone using your app finds out.

Swift has a modern testing library called **Swift Testing**. A test is a function marked `@Test`, and `#expect` checks a condition:

```swift
import Testing

@Test func addingTax() {
    let price = withTax(100)
    #expect(price == 120)
}
```

When an expectation fails, Swift Testing shows you the values on both sides, so you can see at a glance what went wrong:

```
Expectation failed: (price → 118.0) == 120
```

Tests live in their own **test target**, separate from your app, so they never ship to the people using it. The next lessons happen on your Mac, in Terminal and Xcode.

> **Note** You may also meet **XCTest**, Apple's older testing framework, in existing projects. As of Swift 6.4 the two work together, so a project can move to Swift Testing one file at a time.

# --questions--

## What does `#expect(total == 10)` do?
- [x] Checks the condition, and reports the values on both sides if it fails
- [ ] Sets `total` to 10
- [ ] Stops the app if `total` is not 10
Why: It records a failure with helpful detail, then the test carries on.

## Where do tests live?
- [ ] Inside the app's main code
- [x] In a separate test target that never ships to users
- [ ] On a server
Why: Test targets are built only when you run the tests.

---
id: testing-package
title: Your first tested package
type: xcode
minutes: 20
---
# --description--

A **Swift package** is the standard way to share Swift code: a folder with your code, its tests, and a `Package.swift` file describing them. Packages build in Terminal with the `swift` command, and open in Xcode with a double click.

Open **Terminal** and make a package called `Tally`:

```
mkdir Tally && cd Tally
swift package init --type library --enable-swift-testing
```

This creates:

| Path | What it is |
| --- | --- |
| `Package.swift` | The package description |
| `Sources/Tally/Tally.swift` | Your library's code |
| `Tests/TallyTests/TallyTests.swift` | Its tests |

Replace `Sources/Tally/Tally.swift` with a small function to test:

```swift
public func wordFrequencies(in text: String) -> [String: Int] {
    var counts: [String: Int] = [:]
    for word in text.lowercased().split(whereSeparator: { !$0.isLetter }) {
        counts[String(word), default: 0] += 1
    }
    return counts
}
```

`public` makes the function visible outside the package, including to its tests.

Now replace `Tests/TallyTests/TallyTests.swift` with:

```swift
import Testing
@testable import Tally

@Test func countsRepeatedWords() {
    let counts = wordFrequencies(in: "the cat and the hat")
    #expect(counts["the"] == 2)
    #expect(counts["cat"] == 1)
}

@Test func ignoresCaseAndPunctuation() {
    let counts = wordFrequencies(in: "Swift! swift? SWIFT.")
    #expect(counts == ["swift": 3])
}
```

Run them:

```
swift test
```

You should see both tests pass. Now break one on purpose: change `2` to `3` in the first test and run `swift test` again. Read the failure message: it shows exactly what the function returned. Change it back.

Finally, open the package in Xcode with `open Package.swift`. Press ⌘U to run the tests. A diamond appears beside each test in the editor's gutter: click one to run just that test.

# --checklist--

- I created the `Tally` package with `swift package init`.
- `swift test` passed both tests in Terminal.
- I broke a test on purpose and read the failure message.
- I ran the tests in Xcode with ⌘U and with a gutter diamond.

# --questions--

## What does `@testable import Tally` allow?
- [x] Tests can use the module's internal code, not just its public code
- [ ] The tests run faster
- [ ] The tests are skipped
Why: It is for test targets only.

## Which keyboard shortcut runs all tests in Xcode?
- [ ] ⌘R
- [x] ⌘U
- [ ] ⌘B
Why: ⌘R runs the app, ⌘B builds it, ⌘U runs the tests.

---
id: testing-parameterized
title: Parameterized tests and #require
type: xcode
minutes: 15
---
# --description--

## Testing many inputs at once

Often you want to check the same behaviour with many inputs. Instead of copying a test, give `@Test` some **arguments**. The test runs once for each, and each run is reported on its own:

```swift
@Test(arguments: ["", "   ", "\n"])
func blankTextHasNoWords(text: String) {
    #expect(wordFrequencies(in: text).isEmpty)
}
```

Pair two lists with `zip` to give each input its expected answer:

```swift
@Test(arguments: zip(["a a", "b", "c c c"], [2, 1, 3]))
func countsTheOnlyWord(text: String, expected: Int) {
    #expect(wordFrequencies(in: text).values.first == expected)
}
```

## When a test cannot go on

`#expect` records a failure and carries on. Sometimes there is no point carrying on: if a value is `nil`, the rest of the test would only produce confusing failures. `#require` stops the test right there, and is written with `try`. It also unwraps optionals:

```swift
@Test func findsTheCommonestWord() throws {
    let counts = wordFrequencies(in: "to be or not to be")
    let top = try #require(counts.max { $0.value < $1.value })
    #expect(top.value == 2)
}
```

## Names and organisation

Give tests readable names with a string, and group related tests in a `struct` marked `@Suite`:

```swift
@Suite("Word frequencies")
struct FrequencyTests {
    @Test("Counts words regardless of case") func caseInsensitive() { ... }
}
```

Xcode's Test navigator (⌘6) shows suites and tests by these names.

# --instructions--

In your `Tally` package:

1. Add a parameterized test with at least three blank or punctuation-only inputs.
2. Add a test that uses `#require` to unwrap a value before checking it.
3. Group all your tests in a `@Suite`, and run them with `swift test` and in Xcode.

# --checklist--

- I wrote a parameterized test with `@Test(arguments:)`.
- I used `try #require` to unwrap a value.
- I grouped my tests in a `@Suite` with a readable name.
- Every test passes in Terminal and in Xcode.

# --questions--

## What is the difference between `#expect` and `#require`?
- [x] `#require` stops the test when it fails; `#expect` records the failure and carries on
- [ ] There is none
- [ ] `#expect` stops the test; `#require` carries on
Why: Use `#require` when the rest of the test depends on the check.

## What does `@Test(arguments: [1, 2, 3])` do?
- [ ] Runs the test three times with no input
- [x] Runs the test once for each argument, reporting each separately
- [ ] Adds the numbers together
Why: Parameterized tests cover many inputs without copying code.
