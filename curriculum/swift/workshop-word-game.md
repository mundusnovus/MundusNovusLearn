---
id: wordgame-1-setup
title: "Step 1: the game's state"
type: workshop
minutes: 5
---
# --description--

In this workshop you will build a word-guessing game, one step at a time. The player guesses letters; correct letters are revealed, and too many wrong guesses lose the game.

Every step starts from the code you finished in the step before. Each one adds a single new piece, so you can see a real program grow.

A game is mostly **state**: the things it has to remember. Ours needs three:

- the secret word,
- the letters guessed so far,
- how many guesses were wrong.

# --instructions--

Create:

- a constant `secret` holding `"SWIFT"`,
- a variable `guessed`, an empty `Set<Character>`,
- a variable `wrongGuesses`, starting at `0`,
- a constant `maxWrong` set to `6`.

# --tests--

`secret` should be `"SWIFT"`.

```swift
expect(secret == "SWIFT")
```

`secret` should be a constant, declared with `let`.

```source
let\s+secret
```

`guessed` should be an empty `Set<Character>`.

```swift
expect(guessed.isEmpty && type(of: guessed) == Set<Character>.self)
```

`wrongGuesses` should be a variable starting at `0`.

```source
var\s+wrongGuesses\s*=\s*0
```

`maxWrong` should be `6`.

```swift
expect(maxWrong == 6)
```

# --seed--

```swift
// A word-guessing game

```

# --solution--

```swift
// A word-guessing game

let secret = "SWIFT"
var guessed: Set<Character> = []
var wrongGuesses = 0
let maxWrong = 6
```

---
id: wordgame-2-masked
title: "Step 2: showing the word"
type: workshop
minutes: 8
---
# --description--

The player needs to see the word with the unguessed letters hidden, like `S _ _ F _`.

Looping over a `String` gives you each `Character`. For each one, show it if it has been guessed, or `_` if not. Then join the pieces with spaces.

Collecting into an array of strings and calling `joined(separator: " ")` is a neat way to put spaces between the pieces but not at the end.

# --instructions--

Write a function `masked()` that returns a `String`: each letter of `secret`, or `_` if it is not in `guessed`, separated by single spaces.

With nothing guessed it returns `_ _ _ _ _`.

# --tests--

With nothing guessed, `masked()` should return `"_ _ _ _ _"`.

```swift
guessed = []
expect(masked() == "_ _ _ _ _")
```

With `S` and `F` guessed, `masked()` should return `"S _ _ F _"`.

```swift
guessed = ["S", "F"]
expect(masked() == "S _ _ F _")
```

# --seed--

@previous

# --solution--

```swift
// A word-guessing game

let secret = "SWIFT"
var guessed: Set<Character> = []
var wrongGuesses = 0
let maxWrong = 6

func masked() -> String {
    secret.map { guessed.contains($0) ? String($0) : "_" }.joined(separator: " ")
}
```

# --hints--

- `secret.map { … }` runs a closure on each `Character` of the word.
- `String(letter)` turns a `Character` into a `String`.

---
id: wordgame-3-guess
title: "Step 3: making a guess"
type: workshop
minutes: 8
---
# --description--

Now the heart of the game: taking a guess. A guess either reveals a letter or costs the player a life.

Players type in lowercase as often as uppercase, so turn every guess into uppercase first. A `Character` can do that with `uppercased()`, which returns a `String`; take its `first` letter to get a `Character` back.

A guess the player has already made should not count again, right or wrong.

# --instructions--

Write `guess(_ letter: Character) -> Bool`:

1. Make the letter uppercase.
2. If it is already in `guessed`, return `false` and change nothing.
3. Otherwise add it to `guessed`. If `secret` contains it, return `true`. If not, add `1` to `wrongGuesses` and return `false`.

# --tests--

Guessing `"w"` should return `true` and reveal the W.

```swift
guessed = []; wrongGuesses = 0
expect(guess("w") == true)
expect(masked() == "_ W _ _ _")
```

Guessing `"z"` should return `false` and count one wrong guess.

```swift
guessed = []; wrongGuesses = 0
expect(guess("z") == false && wrongGuesses == 1)
```

Guessing `"z"` again should not count again.

```swift
guessed = []; wrongGuesses = 0
_ = guess("z"); _ = guess("Z")
expect(wrongGuesses == 1)
```

# --seed--

@previous

# --solution--

```swift
// A word-guessing game

let secret = "SWIFT"
var guessed: Set<Character> = []
var wrongGuesses = 0
let maxWrong = 6

func masked() -> String {
    secret.map { guessed.contains($0) ? String($0) : "_" }.joined(separator: " ")
}

func guess(_ letter: Character) -> Bool {
    guard let upper = letter.uppercased().first else { return false }
    guard !guessed.contains(upper) else { return false }
    guessed.insert(upper)
    if secret.contains(upper) {
        return true
    }
    wrongGuesses += 1
    return false
}
```

---
id: wordgame-4-status
title: "Step 4: winning and losing"
type: workshop
minutes: 7
---
# --description--

The game needs to know when it is over. The player wins when every letter of the secret has been guessed, and loses when `wrongGuesses` reaches `maxWrong`.

`allSatisfy` is a closure-taking method that answers "is this true for every item?":

```swift
[2, 4, 6].allSatisfy { $0 % 2 == 0 }   // true
```

# --instructions--

Write two functions that return a `Bool`:

- `isWon()`: every letter of `secret` is in `guessed`.
- `isLost()`: `wrongGuesses` has reached `maxWrong`.

# --tests--

`isWon()` should be `false` until every letter is guessed.

```swift
guessed = ["S", "W", "I", "F"]
expect(isWon() == false)
guessed.insert("T")
expect(isWon() == true)
```

`isLost()` should be `true` only at 6 wrong guesses.

```swift
wrongGuesses = 5
expect(isLost() == false)
wrongGuesses = 6
expect(isLost() == true)
```

You should use `allSatisfy`.

```source
allSatisfy
```

# --seed--

@previous

# --solution--

```swift
// A word-guessing game

let secret = "SWIFT"
var guessed: Set<Character> = []
var wrongGuesses = 0
let maxWrong = 6

func masked() -> String {
    secret.map { guessed.contains($0) ? String($0) : "_" }.joined(separator: " ")
}

func guess(_ letter: Character) -> Bool {
    guard let upper = letter.uppercased().first else { return false }
    guard !guessed.contains(upper) else { return false }
    guessed.insert(upper)
    if secret.contains(upper) {
        return true
    }
    wrongGuesses += 1
    return false
}

func isWon() -> Bool {
    secret.allSatisfy { guessed.contains($0) }
}

func isLost() -> Bool {
    wrongGuesses >= maxWrong
}
```

---
id: wordgame-5-play
title: "Step 5: playing a game"
type: workshop
minutes: 10
---
# --description--

Time to play. Here, the player's guesses arrive as a string of letters, one guess per letter. Loop over them, make each guess, and print what happened.

Stop as soon as the game is won or lost, even if there are guesses left. `break` leaves a loop early.

# --instructions--

Write `play(_ guesses: String)`, which:

1. Resets the game: empties `guessed` and sets `wrongGuesses` to `0`.
2. For each letter in `guesses`, makes the guess and prints `"<letter>: <masked>"`, like `S: S _ _ _ _`. Use the letter exactly as given.
3. After each guess, if the game is won, prints `You win!` and stops. If it is lost, prints `Out of guesses. It was SWIFT.` and stops.

Then call `play("sxwift")`.

# --tests--

Your program should print each guess, then `You win!`.

```output
^s: S _ _ _ _\nx: S _ _ _ _\nw: S W _ _ _\ni: S W I _ _\nf: S W I F _\nt: S W I F T\nYou win!$
```

Playing six wrong letters should end with the losing message.

```swift
play("abcdeg")
expect(isLost())
```

`play` should stop as soon as the game ends.

```swift
play("SWIFTZZZZZZ")
expect(wrongGuesses == 0)
```

# --seed--

@previous

# --solution--

```swift
// A word-guessing game

let secret = "SWIFT"
var guessed: Set<Character> = []
var wrongGuesses = 0
let maxWrong = 6

func masked() -> String {
    secret.map { guessed.contains($0) ? String($0) : "_" }.joined(separator: " ")
}

func guess(_ letter: Character) -> Bool {
    guard let upper = letter.uppercased().first else { return false }
    guard !guessed.contains(upper) else { return false }
    guessed.insert(upper)
    if secret.contains(upper) {
        return true
    }
    wrongGuesses += 1
    return false
}

func isWon() -> Bool {
    secret.allSatisfy { guessed.contains($0) }
}

func isLost() -> Bool {
    wrongGuesses >= maxWrong
}

func play(_ guesses: String) {
    guessed = []
    wrongGuesses = 0
    for letter in guesses {
        _ = guess(letter)
        print("\(letter): \(masked())")
        if isWon() {
            print("You win!")
            break
        }
        if isLost() {
            print("Out of guesses. It was \(secret).")
            break
        }
    }
}

play("sxwift")
```

# --hints--

- Write `_ = guess(letter)` to make the guess when you do not need its result.

---
id: wordgame-6-review
title: "Step 6: what you built"
type: quiz
minutes: 4
---
# --description--

You built a complete game from state, a few small functions and a loop. Look back over your code: each function does one job, and its name says which. That is the shape most good programs have, from games to apps.

Ideas to try on your own: pick the secret at random from an array with `words.randomElement()`, show the wrong letters guessed so far, or draw a simple picture as the lives run out.

# --questions--

## Why does `guess` turn the letter into uppercase first?
- [ ] Sets can only hold capital letters
- [x] So `"w"` and `"W"` count as the same guess
- [ ] Characters cannot be compared otherwise
Why: The secret is in capitals, so guesses are made to match.

## Why is `guessed` a `Set` and not an array?
- [x] Each letter only needs to be stored once, and checking it is fast
- [ ] Arrays cannot hold characters
- [ ] Sets keep letters in order
Why: Sets hold unique values and have fast `contains`.

## What does `break` do in `play`?
- [ ] Ends the program
- [x] Leaves the loop, so no more guesses are made after the game ends
- [ ] Skips one guess
Why: `break` exits the loop immediately.
