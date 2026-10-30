---
id: classes-intro
title: Classes and references
type: lesson
minutes: 10
---
# --description--

A **class** looks a lot like a struct: properties, methods, initializers. The big difference is what happens when you copy one.

Structs are values: copying makes an independent copy. Classes are **reference types**: copying gives you a second **reference** to the **same** object.

```swift
class Account {
    var balance: Double

    init(balance: Double) {
        self.balance = balance
    }
}

let mine = Account(balance: 100)
let shared = mine        // the same account, not a copy
shared.balance -= 30
mine.balance             // 70.0: both names point at one object
```

Notice two more differences:

- **Classes have no free memberwise initializer.** You write `init` yourself (unless every property has a default value).
- **No `mutating`.** `mine` is a `let`, yet its balance changed. The constant holds the *reference*, which cannot change; the object it points to can.

References are exactly right when something has an identity and is shared: one bank account seen from several screens, one music player the whole app controls. For plain data, prefer structs.

# --instructions--

1. Define a class `Lamp` with a variable `isOn` (`Bool`) and an initializer that takes it.
2. Create a constant `hallLamp` that is off.
3. Create a constant `sameLamp` from `hallLamp`, then switch `sameLamp` on.

`hallLamp.isOn` should then be `true`, because both names refer to one lamp.

# --tests--

`Lamp` should be a class.

```source
class\s+Lamp
```

`hallLamp` should be on after switching `sameLamp` on.

```swift
expect(hallLamp.isOn == true && sameLamp.isOn == true)
```

`hallLamp` and `sameLamp` should be the very same object.

```swift
expect(hallLamp === sameLamp)
```

# --seed--

```swift

```

# --solution--

```swift
class Lamp {
    var isOn: Bool

    init(isOn: Bool) {
        self.isOn = isOn
    }
}

let hallLamp = Lamp(isOn: false)
let sameLamp = hallLamp
sameLamp.isOn = true
```

---
id: classes-inheritance
title: Inheritance
type: lesson
minutes: 10
---
# --description--

A class can **inherit** from another. The new class, the **subclass**, gets everything its **superclass** has, and can add more or change behaviour:

```swift
class Vehicle {
    var wheels: Int
    init(wheels: Int) { self.wheels = wheels }

    func describe() -> String {
        "A vehicle with \(wheels) wheels"
    }
}

class Bicycle: Vehicle {
    var hasBell: Bool

    init(hasBell: Bool) {
        self.hasBell = hasBell
        super.init(wheels: 2)
    }

    override func describe() -> String {
        super.describe() + (hasBell ? " and a bell" : "")
    }
}

Bicycle(hasBell: true).describe()   // "A vehicle with 2 wheels and a bell"
```

- `class Bicycle: Vehicle` means Bicycle inherits from Vehicle.
- A subclass initializer sets its own properties first, then calls `super.init`.
- `override` replaces a superclass method. Swift insists on the word, so you never override something by accident.
- `super.describe()` calls the superclass's version.

> **Note** Give a superclass an explicit `init`, even an empty `init() {}`. Without one, Swift 6 with Xcode's default settings can report that an initializer "has different actor isolation" from the one it overrides. You will learn what actor isolation means in Concurrency.

Mark a class `final` when nothing should inherit from it. Swift programmers often make classes `final` by default, and prefer protocols (coming soon) for sharing behaviour between types.

# --instructions--

1. Define `Shape` with an empty `init()`, a method `area() -> Double` that returns `0`, and a method `describe() -> String` that returns `"Area: <area>"`, using `area()`.
2. Define `Circle`, a subclass of `Shape` with a `radius` (`Double`), that overrides `area()` to return `3.14 * radius * radius`.
3. Make `Circle` `final`.

# --tests--

`Shape().area()` should be `0`.

```swift
expect(Shape().area() == 0)
```

`Circle(radius: 10).area()` should be `314.0`.

```swift
expect(abs(Circle(radius: 10).area() - 314.0) < 0.0001)
```

`describe()` on a circle should use the circle's area.

```swift
expect(Circle(radius: 1).describe() == "Area: 3.14")
```

`Circle` should be `final`, inherit from `Shape`, and override `area`.

```source
final\s+class\s+Circle\s*:\s*Shape[\s\S]*override\s+func\s+area
```

# --seed--

```swift

```

# --solution--

```swift
class Shape {
    init() {}

    func area() -> Double { 0 }

    func describe() -> String {
        "Area: \(area())"
    }
}

final class Circle: Shape {
    var radius: Double

    init(radius: Double) {
        self.radius = radius
        super.init()
    }

    override func area() -> Double {
        3.14 * radius * radius
    }
}
```

---
id: classes-arc
title: Memory and ARC
type: lesson
minutes: 10
---
# --description--

Every object a class makes takes up memory, and that memory must be freed when the object is no longer needed. Swift does this automatically with **Automatic Reference Counting**, or ARC.

ARC counts how many references point at each object. When the count drops to zero, nothing can reach the object any more, so Swift frees it straight away, and runs its **deinitializer**, `deinit`, if it has one:

```swift
final class Download {
    let name: String
    init(name: String) { self.name = name; print("Started \(name)") }
    deinit { print("Freed \(name)") }
}

var current: Download? = Download(name: "photo.jpg")   // count: 1
current = nil                                          // count: 0, prints "Freed photo.jpg"
```

Making the variable optional lets you set it to `nil`, which removes its reference.

This is predictable and immediate, with no pauses while a garbage collector runs, which is part of why Swift apps feel smooth. Most of the time you never think about it. The one case you do need to think about is in the next lesson.

# --instructions--

1. Give `Session` a `deinit` that prints `Session <name> ended`.
2. Create a variable `session` of type `Session?`, set to a session named `"demo"`.
3. Set `session` to `nil`.

Your program should print the start message and then the end message.

# --tests--

Your program should print `Session demo started` then `Session demo ended`.

```output
^Session demo started\nSession demo ended$
```

`Session` should have a `deinit`.

```source
deinit\s*\{
```

# --seed--

```swift
final class Session {
    let name: String

    init(name: String) {
        self.name = name
        print("Session \(name) started")
    }

}

```

# --solution--

```swift
final class Session {
    let name: String

    init(name: String) {
        self.name = name
        print("Session \(name) started")
    }

    deinit {
        print("Session \(name) ended")
    }
}

var session: Session? = Session(name: "demo")
session = nil
```

---
id: classes-weak
title: Retain cycles, weak and unowned
type: lesson
minutes: 12
---
# --description--

ARC frees an object when nothing points at it. But what if two objects point at **each other**?

```swift
final class Person {
    var pet: Pet?
    deinit { print("Person freed") }
}
final class Pet {
    var owner: Person?
    deinit { print("Pet freed") }
}

var ana: Person? = Person()
var rex: Pet? = Pet()
ana?.pet = rex
rex?.owner = ana
ana = nil
rex = nil   // nothing is printed: both are still alive
```

Each holds the other, so neither count ever reaches zero. This is a **retain cycle**, and it is a memory leak: the objects live forever.

The fix is to make one direction **weak**. A `weak` reference does not count. When the object it points at is freed, it becomes `nil` by itself, so it must be an optional `var`:

```swift
final class Pet {
    weak var owner: Person?   // does not keep the owner alive
}
```

The rule of thumb: the "parent" holds the "child" strongly, and the child points back weakly.

`unowned` is like `weak` but not optional. Use it only when the other object is certain to outlive this one.

## Closures can make cycles too

A closure stored by an object captures what it uses, including `self`, strongly. Break the cycle with a **capture list**:

```swift
button.onTap = { [weak self] in
    self?.save()
}
```

You will see `[weak self]` in many codebases. With SwiftUI and Swift's modern concurrency you need it less often, but knowing why it exists is essential.

# --instructions--

The code below leaks: the person and the pet keep each other alive. Change **one** property to `weak` so that setting both variables to `nil` frees them both, and both messages print.

# --tests--

Your program should print both `Person freed` and `Pet freed`.

```output
Person freed[\s\S]*Pet freed|Pet freed[\s\S]*Person freed
```

You should use `weak`.

```source
weak\s+var
```

# --seed--

```swift
final class Person {
    var pet: Pet?
    deinit { print("Person freed") }
}

final class Pet {
    var owner: Person?
    deinit { print("Pet freed") }
}

var ana: Person? = Person()
var rex: Pet? = Pet()
ana?.pet = rex
rex?.owner = ana
ana = nil
rex = nil
```

# --solution--

```swift
final class Person {
    var pet: Pet?
    deinit { print("Person freed") }
}

final class Pet {
    weak var owner: Person?
    deinit { print("Pet freed") }
}

var ana: Person? = Person()
var rex: Pet? = Pet()
ana?.pet = rex
rex?.owner = ana
ana = nil
rex = nil
```

---
id: classes-choosing
title: Struct or class?
type: lesson
minutes: 8
---
# --description--

You now know both. How do you choose? Apple's own advice is short: **use a struct by default**. Reach for a class when you need what only a class gives you.

| Choose a struct when… | Choose a class when… |
| --- | --- |
| It is plain data: a song, a point, an order | It has an identity that is shared: one player, one connection |
| Copies should be independent | Everyone should see the same changes |
| You want Swift to guarantee nobody changes it behind your back | You need inheritance, or `deinit` to clean up |

In SwiftUI apps you will mostly write structs: every view is a struct. Your app's shared **model** will often be a class marked `@Observable`, so that every screen sees the same data and updates when it changes. You will meet that in the SwiftUI chapter.

A quick test you can apply: "If I copy this, should changing the copy change the original?" If no, struct. If yes, class.

# --instructions--

Two types are half-written. Make `Note` a **struct** (plain data that is copied freely) and `NoteStore` a **class** (one shared store that everything uses). Then:

1. Create a `let store = NoteStore()`.
2. Add a note with the text `"Buy milk"` to `store.notes`.
3. Create `copy` from that note, change `copy.text` to `"Buy oat milk"`, and check the stored note is unchanged.

# --tests--

`Note` should be a struct and `NoteStore` a class.

```source
struct\s+Note\b[\s\S]*class\s+NoteStore|class\s+NoteStore[\s\S]*struct\s+Note\b
```

The store should hold one note reading `"Buy milk"`.

```swift
expect(store.notes.count == 1 && store.notes[0].text == "Buy milk")
```

`copy.text` should be `"Buy oat milk"`.

```swift
expect(copy.text == "Buy oat milk")
```

# --seed--

```swift
// Make Note a struct and NoteStore a class.
TYPE Note {
    var text: String
}

TYPE NoteStore {
    var notes: [Note] = []
}

```

# --solution--

```swift
struct Note {
    var text: String
}

final class NoteStore {
    var notes: [Note] = []
}

let store = NoteStore()
store.notes.append(Note(text: "Buy milk"))
var copy = store.notes[0]
copy.text = "Buy oat milk"
```

---
id: classes-quiz
title: "Quiz: classes and memory"
type: quiz
minutes: 4
---
# --description--

Five questions on classes and memory.

# --questions--

## `a` and `b` refer to the same class instance. You change `b.name`. What happens to `a.name`?
- [x] It changes too: they are one object
- [ ] It stays the same: `b` is a copy
- [ ] Swift stops you with an error
Why: Classes are reference types; copying the reference shares the object.

## When does ARC free a class instance?
- [ ] Every few seconds
- [x] As soon as no strong references point at it
- [ ] When the program ends
Why: ARC counts strong references and frees the object when the count reaches zero.

## Two objects hold strong references to each other. What is this called?
- [ ] Inheritance
- [x] A retain cycle
- [ ] A capture list
Why: Neither count can reach zero, so neither object is freed.

## Why must a `weak` property be an optional `var`?
- [x] It becomes `nil` by itself when the object it points at is freed
- [ ] So it can be overridden
- [ ] Weak properties are always empty
Why: Swift sets a weak reference to `nil` when its object goes away.

## Which should usually be your first choice for a new type?
- [x] A struct
- [ ] A class
- [ ] A tuple
Why: Prefer structs; reach for classes when you need shared identity, inheritance or `deinit`.
