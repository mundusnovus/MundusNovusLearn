---
id: structs-intro
title: Your own types with struct
type: lesson
minutes: 10
---
# --description--

So far you have used Swift's types: `Int`, `String`, arrays. Real programs are about real things: books, songs, players, orders. A **struct** lets you make your own type that groups everything about one thing.

```swift
struct Book {
    let title: String
    let author: String
    var pagesRead: Int
}
```

`title`, `author` and `pagesRead` are **properties**. Each `Book` has its own copy of them. Swift writes an initializer for you, called the **memberwise initializer**, with a parameter for each property:

```swift
var dune = Book(title: "Dune", author: "Frank Herbert", pagesRead: 0)
print(dune.title)       // Dune
dune.pagesRead = 120    // fine: pagesRead is a var
```

Two kinds of "constant" are at work here:

- A `let` **property** can never change once the book is made.
- A struct stored in a `let` **constant** cannot change at all, not even its `var` properties:

```swift
let fixed = Book(title: "Emma", author: "Jane Austen", pagesRead: 10)
fixed.pagesRead = 20   // error: 'fixed' is a 'let' constant
```

Type names start with a capital letter (`Book`); property and variable names start with a small one (`pagesRead`).

# --instructions--

1. Define a struct `Song` with three properties: `title` (`String`, constant), `artist` (`String`, constant) and `plays` (`Int`, variable).
2. Create a variable `song` for `"Freely Given"` by `"Asteria Technology"` with `0` plays.
3. Add `1` to its plays twice.

# --tests--

`Song` should be a struct with `title`, `artist` and `plays`.

```swift
let s = Song(title: "A", artist: "B", plays: 3)
expect(s.title == "A" && s.artist == "B" && s.plays == 3)
```

`song` should have `2` plays.

```swift
expect(song.title == "Freely Given" && song.artist == "Asteria Technology" && song.plays == 2)
```

`title` and `artist` should be constants, and `plays` a variable.

```source
struct\s+Song\s*\{[\s\S]*let\s+title[\s\S]*let\s+artist[\s\S]*var\s+plays
```

# --seed--

```swift

```

# --solution--

```swift
struct Song {
    let title: String
    let artist: String
    var plays: Int
}

var song = Song(title: "Freely Given", artist: "Asteria Technology", plays: 0)
song.plays += 1
song.plays += 1
```

---
id: structs-methods
title: Methods and mutating
type: lesson
minutes: 10
---
# --description--

Functions that belong to a type are called **methods**. Inside a method, the type's properties are available by name:

```swift
struct Rectangle {
    var width: Double
    var height: Double

    func area() -> Double {
        width * height
    }
}

let r = Rectangle(width: 3, height: 4)
r.area()   // 12.0
```

A method that **changes** a struct's properties must be marked `mutating`. This is a promise Swift can check: only `mutating` methods change things, and they can only be called on a `var`:

```swift
struct Rectangle {
    var width: Double
    var height: Double

    mutating func scale(by factor: Double) {
        width *= factor
        height *= factor
    }
}

var box = Rectangle(width: 2, height: 3)
box.scale(by: 2)   // width 4, height 6
```

When you need to be explicit, `self` means "this instance": `self.width`. It is mostly optional, but you will need it when a parameter has the same name as a property.

# --instructions--

Complete `Counter`:

1. `increment()` adds `1` to `count`.
2. `reset()` sets `count` back to `0`.
3. `isOver(_ limit: Int) -> Bool` returns whether `count` is greater than `limit`.

Mark only the methods that change `count` as `mutating`.

# --tests--

`increment()` should add one each time.

```swift
var c = Counter()
c.increment(); c.increment(); c.increment()
expect(c.count == 3)
```

`reset()` should set the count to zero.

```swift
var c = Counter(count: 9)
c.reset()
expect(c.count == 0)
```

`isOver(2)` should be `true` when the count is 3.

```swift
let c = Counter(count: 3)
expect(c.isOver(2) && !c.isOver(3))
```

`increment` and `reset` should be `mutating`, and `isOver` should not.

```source
mutating\s+func\s+increment[\s\S]*mutating\s+func\s+reset[\s\S]*(?<!mutating )func\s+isOver|mutating\s+func\s+reset[\s\S]*mutating\s+func\s+increment
```

# --seed--

```swift
struct Counter {
    var count = 0

}
```

# --solution--

```swift
struct Counter {
    var count = 0

    mutating func increment() {
        count += 1
    }

    mutating func reset() {
        count = 0
    }

    func isOver(_ limit: Int) -> Bool {
        count > limit
    }
}
```

---
id: structs-init
title: Initializers
type: lesson
minutes: 10
---
# --description--

An **initializer** sets up a new instance, giving every property its first value. You have been using the free memberwise one. Write your own with `init` when you want a friendlier or safer way to make values:

```swift
struct Temperature {
    var celsius: Double

    init(celsius: Double) {
        self.celsius = celsius
    }

    init(fahrenheit: Double) {
        celsius = (fahrenheit - 32) * 5 / 9
    }
}

let a = Temperature(celsius: 20)
let b = Temperature(fahrenheit: 68)   // also 20 °C
```

Rules worth knowing:

- Every property must have a value by the end of `init`. Swift checks this for you.
- A property can have a default value right where it is declared, like `var count = 0`. Then initializers do not have to set it.
- Writing your own `init` inside the struct replaces the free memberwise one. To keep both, write yours in an **extension** instead, which you will meet soon.

An initializer can also fail, by being written `init?`. It returns an optional, and `return nil` means "no value could be made":

```swift
struct Percentage {
    let value: Int
    init?(_ value: Int) {
        guard (0...100).contains(value) else { return nil }
        self.value = value
    }
}

Percentage(50)    // a Percentage
Percentage(120)   // nil
```

# --instructions--

Write a struct `Duration` with one stored property, `seconds` (`Int`), and two initializers:

- `init(seconds: Int)`
- `init(minutes: Int, seconds: Int)`, which stores the total number of seconds.

Then add a failable initializer `init?(text: String)` that reads text like `"3:20"` (minutes and seconds) and returns `nil` if either part is not a number. `text.split(separator: ":")` gives you the parts.

# --tests--

`Duration(seconds: 90).seconds` should be `90`.

```swift
expect(Duration(seconds: 90).seconds == 90)
```

`Duration(minutes: 2, seconds: 5).seconds` should be `125`.

```swift
expect(Duration(minutes: 2, seconds: 5).seconds == 125)
```

`Duration(text: "3:20")?.seconds` should be `200`.

```swift
expect(Duration(text: "3:20")?.seconds == 200)
```

`Duration(text: "three")` and `Duration(text: "3:xx")` should be `nil`.

```swift
expect(Duration(text: "three") == nil && Duration(text: "3:xx") == nil)
```

# --seed--

```swift
struct Duration {
    let seconds: Int

}
```

# --solution--

```swift
struct Duration {
    let seconds: Int

    init(seconds: Int) {
        self.seconds = seconds
    }

    init(minutes: Int, seconds: Int) {
        self.seconds = minutes * 60 + seconds
    }

    init?(text: String) {
        let parts = text.split(separator: ":")
        guard parts.count == 2, let m = Int(parts[0]), let s = Int(parts[1]) else { return nil }
        self.init(minutes: m, seconds: s)
    }
}
```

# --hints--

- One initializer can call another with `self.init(...)`.

---
id: structs-computed
title: Computed properties and observers
type: lesson
minutes: 10
---
# --description--

Not every property needs to be stored. A **computed property** works out its value each time you read it, from other properties:

```swift
struct Order {
    var price: Double
    var quantity: Int

    var total: Double {
        price * Double(quantity)
    }
}

var o = Order(price: 2.5, quantity: 4)
o.total          // 10.0
o.quantity = 6
o.total          // 15.0: always up to date
```

Computed properties are always `var`, and they are perfect for anything you would otherwise have to remember to update.

A stored property can run code when it changes, with a **property observer**. `didSet` runs after the change and can see the old value as `oldValue`:

```swift
struct Player {
    var score = 0 {
        didSet {
            if score > oldValue { print("Up \(score - oldValue)!") }
        }
    }
}
```

There is also `willSet`, which runs just before a change, with the coming value as `newValue`. In SwiftUI apps you will mostly let the framework react to changes, but observers are handy in models.

# --instructions--

Complete `Rectangle`:

1. A computed property `area` (width × height).
2. A computed property `isSquare` (`Bool`).
3. Give `width` a `didSet` observer that stops it going below `0`: if it is set to a negative value, set it to `0`.

# --tests--

`area` should be width times height.

```swift
expect(Rectangle(width: 3, height: 4).area == 12)
```

`isSquare` should be `true` only when the sides match.

```swift
expect(Rectangle(width: 5, height: 5).isSquare && !Rectangle(width: 5, height: 4).isSquare)
```

`area` should update when a side changes.

```swift
var r = Rectangle(width: 2, height: 2)
r.height = 10
expect(r.area == 20)
```

Setting `width` below zero should make it `0`.

```swift
var r = Rectangle(width: 2, height: 2)
r.width = -4
expect(r.width == 0)
```

# --seed--

```swift
struct Rectangle {
    var width: Double
    var height: Double

}
```

# --solution--

```swift
struct Rectangle {
    var width: Double {
        didSet {
            if width < 0 { width = 0 }
        }
    }
    var height: Double

    var area: Double {
        width * height
    }

    var isSquare: Bool {
        width == height
    }
}
```

---
id: structs-values
title: Value types and static members
type: lesson
minutes: 10
---
# --description--

## Structs are values

Structs are **value types**. Assigning one to another variable, or passing it to a function, makes an independent **copy**:

```swift
var a = Rectangle(width: 1, height: 1)
var b = a        // b is a copy
b.width = 10
a.width          // still 1
```

This is the same as with `Int` or `String`: changing one copy never surprises you by changing another. It is a big reason Swift code is easy to reason about, and why Swift's own `Array`, `Dictionary` and `String` are structs too.

## Static members belong to the type

A `static` property or method belongs to the type itself, not to any one instance. Use it for shared constants and handy ready-made values:

```swift
struct Color {
    var red, green, blue: Double

    static let white = Color(red: 1, green: 1, blue: 1)
    static func gray(_ level: Double) -> Color {
        Color(red: level, green: level, blue: level)
    }
}

let background = Color.white
let mid = Color.gray(0.5)
```

When Swift already knows the type, you can drop its name and write just `.white`. You will do that constantly in SwiftUI: `.foregroundStyle(.blue)`.

# --instructions--

1. Add a `static let origin` to `Point`, at `(0, 0)`.
2. Create `start` as `Point.origin`, then `moved` as a copy of `start`, and change `moved.x` to `5`.
3. Show that `start` is unchanged by creating `startX` from `start.x`.

# --tests--

`Point.origin` should be at (0, 0).

```swift
expect(Point.origin.x == 0 && Point.origin.y == 0)
```

`moved.x` should be `5` and `startX` should still be `0`.

```swift
expect(moved.x == 5 && startX == 0)
```

`origin` should be `static`.

```source
static\s+let\s+origin
```

# --seed--

```swift
struct Point {
    var x: Int
    var y: Int

}

```

# --solution--

```swift
struct Point {
    var x: Int
    var y: Int

    static let origin = Point(x: 0, y: 0)
}

let start = Point.origin
var moved = start
moved.x = 5
let startX = start.x
```

---
id: structs-lab-recipe
title: "Lab: a recipe scaler"
type: lab
minutes: 18
---
# --description--

Recipes are written for a certain number of people. Build a small model that scales a recipe to feed any number.

# --instructions--

1. A struct `Ingredient` with `name` (`String`), `amount` (`Double`) and `unit` (`String`).
2. A struct `Recipe` with `name` (`String`), `serves` (`Int`) and `ingredients` (`[Ingredient]`).
3. `Recipe` has a method `scaled(toServe people: Int) -> Recipe` that returns a new recipe for `people`, with every amount scaled in proportion. It does not change the original.
4. `Recipe` has a computed property `shoppingList: [String]`, with one line per ingredient like `"200.0 g flour"`.

# --tests--

Scaling a recipe for 4 to 6 people should multiply each amount by 1.5.

```swift
let r = Recipe(name: "Pancakes", serves: 4, ingredients: [Ingredient(name: "flour", amount: 200, unit: "g"), Ingredient(name: "milk", amount: 300, unit: "ml")])
let big = r.scaled(toServe: 6)
expect(big.serves == 6 && big.ingredients[0].amount == 300 && big.ingredients[1].amount == 450)
```

Scaling should not change the original.

```swift
let r = Recipe(name: "Tea", serves: 2, ingredients: [Ingredient(name: "tea", amount: 2, unit: "bags")])
_ = r.scaled(toServe: 10)
expect(r.serves == 2 && r.ingredients[0].amount == 2)
```

`shoppingList` should list each ingredient.

```swift
let r = Recipe(name: "Pancakes", serves: 4, ingredients: [Ingredient(name: "flour", amount: 200, unit: "g"), Ingredient(name: "eggs", amount: 2, unit: "whole")])
expect(r.shoppingList == ["200.0 g flour", "2.0 whole eggs"])
```

# --seed--

```swift

```

# --solution--

```swift
struct Ingredient {
    var name: String
    var amount: Double
    var unit: String
}

struct Recipe {
    var name: String
    var serves: Int
    var ingredients: [Ingredient]

    func scaled(toServe people: Int) -> Recipe {
        let factor = Double(people) / Double(serves)
        var copy = self
        copy.serves = people
        copy.ingredients = ingredients.map { item in
            var scaled = item
            scaled.amount *= factor
            return scaled
        }
        return copy
    }

    var shoppingList: [String] {
        ingredients.map { "\($0.amount) \($0.unit) \($0.name)" }
    }
}
```

# --hints--

- Because structs are values, `var copy = self` gives you a copy to change and return.

---
id: structs-quiz
title: "Quiz: structs"
type: quiz
minutes: 4
---
# --description--

Five questions on structs.

# --questions--

## Why must a method be marked `mutating` to change a property?
- [x] So Swift knows which methods change the value, and can stop them being called on a `let`
- [ ] Because methods cannot see properties otherwise
- [ ] To make the method faster
Why: `mutating` is a promise Swift checks: constants can only use non-mutating methods.

## After `var b = a; b.score = 10`, where `a` is a struct, what is `a.score`?
- [x] Whatever it was before: `b` is a separate copy
- [ ] `10`
- [ ] It depends on the struct
Why: Structs are value types. Assigning one copies it.

## What is a computed property?
- [ ] A property that can only be set once
- [x] A property whose value is worked out from other values each time it is read
- [ ] A property shared by every instance
Why: Computed properties store nothing; they calculate.

## What does `init?` mean?
- [ ] An initializer that can be skipped
- [x] An initializer that can fail and give `nil`
- [ ] An initializer with optional parameters
Why: A failable initializer returns an optional instance.

## How do you use a `static let shared` on a type `Settings`?
- [ ] `Settings().shared`
- [x] `Settings.shared`
- [ ] `shared.Settings`
Why: Static members belong to the type, so you reach them through the type's name.
