---
id: collections-arrays
title: Arrays
type: lesson
minutes: 8
---
# --description--

An **array** holds an ordered list of values of one type. Write it with square brackets:

```swift
let planets = ["Mercury", "Venus", "Earth", "Mars"]
```

Swift infers the type `[String]`: an array of strings. Each item has a position called its **index**, counting from **zero**:

```swift
planets[0]     // "Mercury"
planets[2]     // "Earth"
planets.count  // 4
```

The last index is always `count - 1`. Asking for an index that does not exist, like `planets[4]`, stops the program with an error, so check `count` when you are not sure.

To change an array, it must be a `var`. `append` adds to the end:

```swift
var visited = ["Earth"]
visited.append("Moon")
visited += ["Mars", "Phobos"]   // adds several at once
visited.count                   // 4
```

An empty array needs its type written out, because there is nothing for Swift to infer from:

```swift
var scores: [Int] = []
scores.isEmpty   // true
```

# --instructions--

1. Create a variable `colors` holding `"red"`, `"green"` and `"blue"`, in that order.
2. Add `"gold"` to the end.
3. Create a constant `second` holding the second color, read from the array by its index.
4. Print `colors.count`.

# --tests--

`colors` should be `["red", "green", "blue", "gold"]`.

```swift
expect(colors == ["red", "green", "blue", "gold"])
```

You should add `"gold"` with `append` or `+=`.

```source
colors\.append\(\s*"gold"\s*\)|colors\s*\+=\s*\[\s*"gold"\s*\]
```

`second` should be `"green"`, read with `colors[1]`.

```swift
expect(second == "green")
```

You should read `second` from the array by index.

```source
second\s*=\s*colors\[\s*1\s*\]
```

Your program should print `4`.

```output
^4$
```

# --seed--

```swift

```

# --solution--

```swift
var colors = ["red", "green", "blue"]
colors.append("gold")
let second = colors[1]
print(colors.count)
```

# --hints--

- Indexes start at zero, so the second item is at index `1`.

---
id: collections-array-methods
title: Working with arrays
type: lesson
minutes: 9
---
# --description--

Arrays come with many useful tools. Here are the ones you will reach for most:

```swift
var queue = ["Ana", "Ben", "Cleo"]

queue.contains("Ben")        // true
queue.insert("Zoe", at: 0)   // ["Zoe", "Ana", "Ben", "Cleo"]
queue.remove(at: 1)          // removes "Ana" and gives it back
queue.removeLast()           // removes "Cleo"
queue.first                  // the first item, if there is one
queue.reversed()             // the items in the opposite order
```

`sort()` puts an array in order where it stands. `sorted()` leaves it alone and gives you a sorted copy:

```swift
var numbers = [5, 2, 9, 1]
let ordered = numbers.sorted()   // [1, 2, 5, 9], numbers is unchanged
numbers.sort()                   // numbers is now [1, 2, 5, 9]
```

This is a pattern you will see across Swift: a verb like `sort` changes the value itself, and the same word ending in *-ed* or *-ing* gives you a new value instead.

Numbers have a few extras:

```swift
let marks = [70, 85, 92]
marks.min()   // 70
marks.max()   // 92
```

`first`, `min()` and `max()` give back an *optional*, because an empty array has no first, smallest or largest item. You will learn all about optionals soon. For now, `?? 0` gives a fallback value if there is nothing there: `marks.max() ?? 0`.

# --instructions--

`scores` holds some results.

1. Create `ranked`: a copy of `scores` sorted from smallest to largest, leaving `scores` unchanged.
2. Create `best`: the highest score, using `max()` with `?? 0` as the fallback.
3. Create `hasPerfect`: `true` if `scores` contains `100`.

# --tests--

`ranked` should be `[54, 77, 88, 100]`.

```swift
expect(ranked == [54, 77, 88, 100])
```

`scores` should be unchanged.

```swift
expect(scores == [88, 54, 100, 77])
```

`best` should be `100`.

```swift
expect(best == 100)
```

`hasPerfect` should be `true`, using `contains`.

```swift
expect(hasPerfect == true)
```

You should use `sorted()`, `max()` and `contains`.

```source
sorted\(\)[\s\S]*max\(\)[\s\S]*contains\(|contains\([\s\S]*sorted\(\)|max\(\)[\s\S]*sorted\(\)[\s\S]*contains\(
```

# --seed--

```swift
let scores = [88, 54, 100, 77]

```

# --solution--

```swift
let scores = [88, 54, 100, 77]
let ranked = scores.sorted()
let best = scores.max() ?? 0
let hasPerfect = scores.contains(100)
```

---
id: collections-dictionaries
title: Dictionaries
type: lesson
minutes: 10
---
# --description--

A **dictionary** stores values by **key** instead of by position. Think of a real dictionary: you look up a word (the key) to find its meaning (the value).

```swift
var capitals = ["France": "Paris", "Japan": "Tokyo", "Kenya": "Nairobi"]
```

Its type is `[String: String]`: string keys, string values. Look a value up with its key in square brackets:

```swift
capitals["Japan"]     // "Tokyo"
capitals["Narnia"]    // nil: there is no such key
```

Because a key might not be there, a lookup gives an *optional*: either the value, or `nil` (nothing). Use `??` to supply a default:

```swift
let capital = capitals["Narnia"] ?? "Unknown"   // "Unknown"
```

Adding and changing use the same syntax. Setting a key to `nil` removes it:

```swift
capitals["Peru"] = "Lima"       // adds a new pair
capitals["France"] = "Paris"    // replaces the value for an existing key
capitals["Kenya"] = nil         // removes the pair
capitals.count                  // 3
```

A dictionary has no order. Keys are unique: each key appears once, though the same value can appear under many keys.

Dictionaries can hold any types. A common one counts things:

```swift
var stock: [String: Int] = ["apples": 6]
stock["apples", default: 0] += 3    // 9
stock["pears", default: 0] += 2     // 2: a missing key starts at the default
```

# --instructions--

`stock` tracks how many of each fruit a shop has.

1. Add `"cherries"` with a count of `40`.
2. The shop sold 4 apples: take `4` from `"apples"`.
3. The shop stopped selling bananas: remove `"bananas"`.
4. Create `pears`: the number of pears, or `0` if there are none.

# --tests--

`stock["cherries"]` should be `40`.

```swift
expect(stock["cherries"] == 40)
```

`stock["apples"]` should be `8`.

```swift
expect(stock["apples"] == 8)
```

`"bananas"` should be gone.

```swift
expect(stock["bananas"] == nil && stock.count == 2)
```

`pears` should be `0`, worked out with `??` or `default:`.

```swift
expect(pears == 0)
```

You should look the pears up in `stock`.

```source
pears\s*=\s*stock\[
```

# --seed--

```swift
var stock = ["apples": 12, "bananas": 7]

```

# --solution--

```swift
var stock = ["apples": 12, "bananas": 7]
stock["cherries"] = 40
stock["apples", default: 0] -= 4
stock["bananas"] = nil
let pears = stock["pears"] ?? 0
```

# --hints--

- `stock["apples", default: 0] -= 4` subtracts in one step.
- Setting a key to `nil` removes it.

---
id: collections-sets
title: Sets
type: lesson
minutes: 8
---
# --description--

A **set** is a collection of unique values with no order. Make one by writing the type, because square brackets alone make an array:

```swift
var tags: Set<String> = ["swift", "ios", "swift"]
tags.count   // 2: the repeated "swift" is kept once
```

Sets shine in two jobs. The first is removing duplicates:

```swift
let visits = ["Ana", "Ben", "Ana", "Cleo", "Ben"]
let people = Set(visits)   // {"Ana", "Ben", "Cleo"}, in some order
```

The second is checking membership quickly. `contains` on a set is fast however large it grows, while an array has to look at items one by one.

Sets can also be compared and combined:

```swift
let monday: Set = ["Ana", "Ben", "Cleo"]
let tuesday: Set = ["Ben", "Dev"]

monday.union(tuesday)          // everyone: Ana, Ben, Cleo, Dev
monday.intersection(tuesday)   // on both days: Ben
monday.subtracting(tuesday)    // Monday only: Ana, Cleo
```

Add with `insert` and remove with `remove`. To get the items in order, use `sorted()`, which gives back an array.

# --instructions--

Two classes list the languages their students speak.

1. Create `either`: every language spoken in either class.
2. Create `both`: the languages spoken in both classes.
3. Create `onlyA`: an array, sorted alphabetically, of languages spoken only in `classA`.

# --tests--

`either` should hold all five languages.

```swift
expect(either == ["English", "Spanish", "Mandarin", "Hindi", "Arabic"])
```

`both` should hold English and Spanish.

```swift
expect(both == ["English", "Spanish"])
```

`onlyA` should be `["Mandarin"]`.

```swift
expect(onlyA == ["Mandarin"])
```

You should use set operations, not list the languages yourself.

```source
union[\s\S]*intersection|intersection[\s\S]*union
```

# --seed--

```swift
let classA: Set = ["English", "Spanish", "Mandarin"]
let classB: Set = ["English", "Spanish", "Hindi", "Arabic"]

```

# --solution--

```swift
let classA: Set = ["English", "Spanish", "Mandarin"]
let classB: Set = ["English", "Spanish", "Hindi", "Arabic"]

let either = classA.union(classB)
let both = classA.intersection(classB)
let onlyA = classA.subtracting(classB).sorted()
```

---
id: collections-tuples
title: Tuples
type: lesson
minutes: 7
---
# --description--

A **tuple** groups a few values together, even of different types, without making a new type for them. Write them in parentheses:

```swift
let point = (3, 4)
point.0   // 3
point.1   // 4
```

Naming the parts makes code much clearer:

```swift
let size = (width: 1920, height: 1080)
size.width    // 1920
```

You can unpack a tuple into separate constants in one go. This is called **destructuring**:

```swift
let (w, h) = size
print(w * h)   // 2073600
```

Tuples are perfect for small, short-lived groups, such as a function that gives back two things (you will do that in Functions). For anything bigger or longer-lived, you will use a `struct`, which you meet in Modelling with types.

# --instructions--

1. Create a constant `book`: a tuple with named parts `title` (`"Dune"`) and `pages` (`412`).
2. Destructure it into two constants, `t` and `p`.
3. Print `Dune has 412 pages.` using `t` and `p`.

# --tests--

`book.title` should be `"Dune"` and `book.pages` should be `412`.

```swift
expect(book.title == "Dune" && book.pages == 412)
```

You should destructure `book` into `t` and `p`.

```source
let\s*\(\s*t\s*,\s*p\s*\)\s*=\s*book
```

Your program should print `Dune has 412 pages.`

```output
^Dune has 412 pages\.$
```

# --seed--

```swift

```

# --solution--

```swift
let book = (title: "Dune", pages: 412)
let (t, p) = book
print("\(t) has \(p) pages.")
```

---
id: collections-lab-groceries
title: "Lab: a shopping list"
type: lab
minutes: 15
---
# --description--

Build the data behind a shared shopping list. You have a list of items two people added, with some added twice, and a price list.

# --instructions--

1. Create `uniqueItems`: the items in `added` without duplicates, as an array sorted alphabetically.
2. Create `total`, a `Double`: the sum of the prices of every unique item, looked up in `prices`. Treat an item missing from `prices` as costing `0.0`.
3. Create `missing`: a sorted array of the unique items that have no price.
4. Print `4 items, total 7.25`.

Build `total` by looping over `uniqueItems`. You can write a loop like this, and Loops are coming in the next module:

```swift
var sum = 0.0
for item in uniqueItems {
    sum += prices[item] ?? 0.0
}
```

# --tests--

`uniqueItems` should be `["bread", "eggs", "milk", "tea"]`.

```swift
expect(uniqueItems == ["bread", "eggs", "milk", "tea"])
```

`total` should be `7.25`.

```swift
expect(abs(total - 7.25) < 0.0001)
```

`missing` should be `["tea"]`.

```swift
expect(missing == ["tea"])
```

Your program should print `4 items, total 7.25`.

```output
^4 items, total 7\.25$
```

# --seed--

```swift
let added = ["milk", "bread", "eggs", "milk", "tea", "bread"]
let prices = ["milk": 1.25, "bread": 3.5, "eggs": 2.5]

```

# --solution--

```swift
let added = ["milk", "bread", "eggs", "milk", "tea", "bread"]
let prices = ["milk": 1.25, "bread": 3.5, "eggs": 2.5]

let uniqueItems = Set(added).sorted()

var total = 0.0
var missing: [String] = []
for item in uniqueItems {
    if let price = prices[item] {
        total += price
    } else {
        missing.append(item)
    }
}
missing.sort()

print("\(uniqueItems.count) items, total \(total)")
```

# --hints--

- `Set(added).sorted()` removes duplicates and sorts in one line.
- To find the missing items, check `prices[item] == nil` for each item.

---
id: collections-quiz
title: "Quiz: collections"
type: quiz
minutes: 4
---
# --description--

Five questions on arrays, dictionaries, sets and tuples.

# --questions--

## What is `["a", "b", "c"][1]`?
- [ ] `"a"`
- [x] `"b"`
- [ ] `"c"`
Why: Indexes start at zero, so index `1` is the second item.

## What does a dictionary lookup like `ages["Zoe"]` give you?
- [ ] Zoe's age, or a crash if there is none
- [x] An optional: Zoe's age, or `nil` if there is no such key
- [ ] `0` if there is no such key
Why: The key might not exist, so the result is optional. Use `?? fallback` or `default:` to supply a value.

## You need to check quickly whether a username is already taken, among millions. Which collection fits best?
- [ ] An array
- [x] A set
- [ ] A tuple
Why: `contains` on a set stays fast however big it gets, and usernames are unique anyway.

## What is the difference between `sort()` and `sorted()`?
- [x] `sort()` changes the array itself; `sorted()` returns a sorted copy
- [ ] `sorted()` changes the array itself; `sort()` returns a sorted copy
- [ ] They are the same
Why: Swift's naming pattern: a plain verb changes the value, the *-ed* form returns a new one.

## Which is the best fit for a function that returns a minimum and a maximum together?
- [x] A tuple like `(min: Int, max: Int)`
- [ ] A dictionary
- [ ] A set
Why: Tuples group a few related values for a short time, with names for each part.
