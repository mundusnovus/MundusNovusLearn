---
id: start-welcome
title: Welcome
type: lesson
minutes: 4
---
# --description--

Welcome to **Swift: Zero to Hero**. By the end of this course you will be able to write Swift with confidence, build apps for iPhone, iPad and Mac with SwiftUI, and ship one to real people through TestFlight and the App Store.

Swift is the language Apple's own apps are written in. It is fast, safe and friendly: it catches whole families of mistakes before your program ever runs, and it reads almost like plain English.

## How the course works

The course has two halves.

- **The Swift language** (chapters 1 to 4). You write code right here, in the editor on the right, and press **Run** to check it. Each lesson ends with a few tests. When they all pass, the lesson is done.
- **Apple apps** (chapters 5 to 9). You move to Xcode on your Mac. Each lesson walks you through building something real, with a checklist to tick off and a short quiz.

Along the way you will meet a few kinds of lesson:

| Kind | What you do |
| --- | --- |
| Lesson | Learn one idea, then use it in a short exercise. |
| Quiz | Check you have understood a module before moving on. |
| Workshop | Build a small program step by step, with help at every step. |
| Lab | Build something from a list of requirements, on your own. |
| Xcode | Follow along in Xcode on your Mac. |
| Project | A bigger app you design and build yourself. |

## What you need

For the first half, nothing but this page. Sign in with your Mundus Novus account to run code and keep your progress.

For the second half you need a Mac with **Xcode 27**, which is free from the Mac App Store. To run your apps on your own iPhone you only need a free Apple Account. To use TestFlight, iCloud, in-app purchases and the App Store, you need the **Apple Developer Program** membership. Chapter 5 explains exactly what it gives you.

> **Tip** Go slowly and type the code yourself rather than copying it. Your fingers learn as much as your eyes do.

# --instructions--

Press **Run** to run the code on the right. It prints a greeting. Then go on to the next lesson.

# --tests--

Your program should print `Welcome to Swift!`.

```output
^Welcome to Swift!$
```

# --seed--

```swift
print("Welcome to Swift!")
```

# --solution--

```swift
print("Welcome to Swift!")
```

---
id: start-hello
title: Hello, world
type: lesson
minutes: 5
---
# --description--

Every programmer's first program says hello. In Swift it is one line:

```swift
print("Hello, world!")
```

`print` is a **function**: a named piece of work you can ask Swift to do. You call it by writing its name followed by parentheses. Whatever you put inside the parentheses is what it works on. Here that is a **string**, a piece of text written between double quotes.

When the program runs, `print` writes the text out and moves to a new line. You can call it as many times as you like, and Swift runs the lines from top to bottom:

```swift
print("First")
print("Second")
```

# --instructions--

Change the program so it prints `Hello, world!` and then, on the next line, `I am learning Swift.`

# --tests--

The first line printed should be `Hello, world!`.

```output
^Hello, world!\n
```

The second line printed should be `I am learning Swift.`

```output
\nI am learning Swift\.$
```

You should call `print` twice.

```source
print\([\s\S]*print\(
```

# --seed--

```swift
print("Hello")
```

# --solution--

```swift
print("Hello, world!")
print("I am learning Swift.")
```

# --hints--

- Each line of output needs its own `print`.
- Check the punctuation: a comma and an exclamation mark in the first line, a full stop at the end of the second.

---
id: start-comments
title: Comments
type: lesson
minutes: 4
---
# --description--

A **comment** is a note for people reading your code. Swift ignores it completely.

A comment that starts with `//` runs to the end of the line:

```swift
// Greet the user
print("Hi!") // this prints Hi!
```

For longer notes, wrap the text in `/*` and `*/`. It can span as many lines as you like:

```swift
/*
 This program prints a greeting.
 Later it will ask for a name.
 */
```

Comments are also a handy way to switch a line off without deleting it: put `//` in front of it, and Swift skips it.

Good comments explain **why** the code does something. The code itself already says **what** it does.

# --instructions--

The program prints two lines, but only the first should appear. Turn the second `print` into a comment so it no longer runs, and add a comment of your own on its own line anywhere in the program.

# --tests--

Your program should print `This line stays.`

```output
^This line stays\.$
```

Your program should not print `This line goes.`

```!output
This line goes
```

The second `print` should be commented out.

```source
//\s*print\("This line goes\."\)
```

# --seed--

```swift
print("This line stays.")
print("This line goes.")
```

# --solution--

```swift
// Only the first line is needed now
print("This line stays.")
// print("This line goes.")
```

---
id: start-quiz
title: Quiz: Welcome to Swift
type: quiz
minutes: 3
---
# --description--

Check what you have learned so far.

# --questions--

## What does `print("Hi")` do?
- [ ] It stores the text `Hi` for later.
- [x] It writes `Hi` out and moves to a new line.
- [ ] It asks the person using the program to type `Hi`.
Why: `print` writes its text to the output and then starts a new line.

## In which order does Swift run these lines?

```swift
print("A")
print("B")
```
- [x] `A`, then `B`
- [ ] `B`, then `A`
- [ ] Both at the same time
Why: Swift runs the lines of a program from top to bottom.

## Which of these is a comment?
- [ ] `print("// hello")`
- [x] `// hello`
- [ ] `"hello"`
Why: `//` starts a comment only outside a string. Inside quotes, it is just text.
