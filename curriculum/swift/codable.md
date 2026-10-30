---
id: codable-basics
title: Codable
type: lesson
minutes: 11
---
# --description--

Apps constantly turn their data into text and back: to save it to a file, or to send it to and from a server. The most common format is **JSON**:

```json
{ "title": "Dune", "pages": 412, "isFavourite": true }
```

Swift does nearly all the work for you through the `Codable` protocol. Mark a type `Codable`, and as long as its properties are codable too (strings, numbers, Bools, arrays, dictionaries, optionals and other codable types), Swift writes the conversion code itself:

```swift
import Foundation

struct Book: Codable {
    let title: String
    let pages: Int
    let isFavourite: Bool
}
```

**Decoding** turns JSON into your type. JSON arrives as `Data`, raw bytes; `Data(text.utf8)` makes some from a string:

```swift
let json = #"{ "title": "Dune", "pages": 412, "isFavourite": true }"#
let book = try JSONDecoder().decode(Book.self, from: Data(json.utf8))
book.title   // "Dune"
```

`#"..."#` is a **raw string**: inside it, quotes and backslashes are just characters, which makes JSON easy to write.

**Encoding** goes the other way:

```swift
let encoder = JSONEncoder()
encoder.outputFormatting = .sortedKeys
let data = try encoder.encode(book)
print(String(decoding: data, as: UTF8.self))
// {"isFavourite":true,"pages":412,"title":"Dune"}
```

Decoding throws if the JSON does not match your type: a missing key, a string where a number should be. That is a feature: bad data is caught at the edge of your app, not deep inside it.

# --instructions--

1. Make `Recipe` a `Codable` struct with `name` (`String`), `minutes` (`Int`) and `ingredients` (`[String]`).
2. Decode `json` into a constant `recipe`.
3. Create `encoded`: `recipe` encoded back to a JSON `String` with sorted keys.

# --tests--

`recipe` should be decoded from the JSON.

```swift
expect(recipe.name == "Pancakes" && recipe.minutes == 20 && recipe.ingredients == ["flour", "milk", "eggs"])
```

`encoded` should be the JSON with sorted keys.

```swift
expect(encoded == #"{"ingredients":["flour","milk","eggs"],"minutes":20,"name":"Pancakes"}"#)
```

`Recipe` should be `Codable`.

```source
struct\s+Recipe\s*:\s*[^{]*Codable
```

# --seed--

```swift
import Foundation

let json = #"{ "name": "Pancakes", "minutes": 20, "ingredients": ["flour", "milk", "eggs"] }"#

```

# --solution--

```swift
import Foundation

let json = #"{ "name": "Pancakes", "minutes": 20, "ingredients": ["flour", "milk", "eggs"] }"#

struct Recipe: Codable {
    let name: String
    let minutes: Int
    let ingredients: [String]
}

let recipe = try JSONDecoder().decode(Recipe.self, from: Data(json.utf8))

let encoder = JSONEncoder()
encoder.outputFormatting = .sortedKeys
let encoded = String(decoding: try encoder.encode(recipe), as: UTF8.self)
```

---
id: codable-keys
title: Matching real-world JSON
type: lesson
minutes: 12
---
# --description--

Real JSON rarely uses Swift's naming style. Servers often write keys in `snake_case`, like `"release_year"`. Two tools bridge the gap.

The decoder can convert snake_case for you:

```swift
let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .convertFromSnakeCase   // release_year -> releaseYear
```

For anything else, list the keys yourself with a nested `CodingKeys` enum. Each case is a property name; its raw value is the key in the JSON:

```swift
struct Track: Codable {
    let title: String
    let lengthInSeconds: Int

    enum CodingKeys: String, CodingKey {
        case title = "name"
        case lengthInSeconds = "duration"
    }
}
```

Nested JSON maps to nested types, and keys that might be missing map to optionals:

```swift
struct Album: Codable {
    let title: String
    let artist: Artist        // a nested object
    let tracks: [Track]       // an array of objects
    let label: String?        // may be missing or null
}

struct Artist: Codable {
    let name: String
}
```

A good habit: write your Swift types the way your *app* wants them, then use `CodingKeys` and strategies to fit the JSON to them, rather than letting a server's naming leak through your code.

# --instructions--

Decode `json` into `Show`:

1. `Show` has `title`, `firstAired` (from `"first_aired"`), `seasons` (an array of `Season`) and an optional `network`.
2. `Season` has `number` and `episodeCount`, where `episodeCount` comes from the key `"episodes"`.
3. Use `.convertFromSnakeCase` for `first_aired`, and a `CodingKeys` enum in `Season`.
4. Create `show` by decoding, and `totalEpisodes`: the total across all seasons.

# --tests--

`show.title` should be `"Planet Swift"` and `show.firstAired` should be `2019`.

```swift
expect(show.title == "Planet Swift" && show.firstAired == 2019)
```

`show.network` should be `nil`.

```swift
expect(show.network == nil)
```

`totalEpisodes` should be `22`.

```swift
expect(totalEpisodes == 22)
```

You should use `convertFromSnakeCase` and `CodingKeys`.

```source
convertFromSnakeCase[\s\S]*CodingKeys|CodingKeys[\s\S]*convertFromSnakeCase
```

# --seed--

```swift
import Foundation

let json = #"""
{
  "title": "Planet Swift",
  "first_aired": 2019,
  "seasons": [
    { "number": 1, "episodes": 10 },
    { "number": 2, "episodes": 12 }
  ]
}
"""#

```

# --solution--

```swift
import Foundation

let json = #"""
{
  "title": "Planet Swift",
  "first_aired": 2019,
  "seasons": [
    { "number": 1, "episodes": 10 },
    { "number": 2, "episodes": 12 }
  ]
}
"""#

struct Season: Codable {
    let number: Int
    let episodeCount: Int

    enum CodingKeys: String, CodingKey {
        case number
        case episodeCount = "episodes"
    }
}

struct Show: Codable {
    let title: String
    let firstAired: Int
    let seasons: [Season]
    let network: String?
}

let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .convertFromSnakeCase
let show = try decoder.decode(Show.self, from: Data(json.utf8))
let totalEpisodes = show.seasons.reduce(0) { $0 + $1.episodeCount }
```

---
id: codable-lab-weather
title: "Lab: a weather report"
type: lab
minutes: 18
---
# --description--

A weather service sends a forecast as JSON. Decode it, and turn it into a short report a person would want to read.

# --instructions--

1. Model the JSON with `Codable` types. Use `.convertFromSnakeCase`.
2. Write `report(from json: String) throws -> String` that decodes the forecast and returns lines like this, one per day, joined with new lines:

```
Mon: 18° to 24°, rain likely
Tue: 15° to 20°
```

A day says `, rain likely` when its `rain_chance` is `0.5` or more. Temperatures are whole numbers.

3. If the JSON cannot be decoded, `report` should throw.

# --tests--

The report for the sample forecast should list both days.

```swift
let text = try? report(from: sample)
expect(text == "Mon: 18° to 24°, rain likely\nTue: 15° to 20°")
```

Bad JSON should throw.

```swift
var threw = false
do { _ = try report(from: "{ not json") } catch { threw = true }
expect(threw)
```

You should decode with `convertFromSnakeCase`.

```source
convertFromSnakeCase
```

# --seed--

```swift
import Foundation

let sample = #"""
{
  "city": "Lisbon",
  "days": [
    { "name": "Mon", "low_temp": 18, "high_temp": 24, "rain_chance": 0.7 },
    { "name": "Tue", "low_temp": 15, "high_temp": 20, "rain_chance": 0.1 }
  ]
}
"""#

```

# --solution--

```swift
import Foundation

let sample = #"""
{
  "city": "Lisbon",
  "days": [
    { "name": "Mon", "low_temp": 18, "high_temp": 24, "rain_chance": 0.7 },
    { "name": "Tue", "low_temp": 15, "high_temp": 20, "rain_chance": 0.1 }
  ]
}
"""#

struct Forecast: Codable {
    let city: String
    let days: [Day]
}

struct Day: Codable {
    let name: String
    let lowTemp: Int
    let highTemp: Int
    let rainChance: Double
}

func report(from json: String) throws -> String {
    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let forecast = try decoder.decode(Forecast.self, from: Data(json.utf8))
    return forecast.days.map { day in
        "\(day.name): \(day.lowTemp)° to \(day.highTemp)°" + (day.rainChance >= 0.5 ? ", rain likely" : "")
    }.joined(separator: "\n")
}
```

---
id: codable-quiz
title: "Quiz: Codable"
type: quiz
minutes: 3
---
# --description--

Four questions on Codable and JSON.

# --questions--

## What do you need to write for Swift to encode and decode a struct of strings and numbers?
- [x] Mark it `Codable`
- [ ] An `encode` and a `decode` method
- [ ] Nothing at all
Why: Swift writes the code when every property is codable.

## The JSON key is `"user_name"` and your property is `userName`. What is the simplest fix?
- [ ] Rename the property `user_name`
- [x] `decoder.keyDecodingStrategy = .convertFromSnakeCase`
- [ ] Decode it by hand
Why: The strategy converts snake_case keys for the whole decode.

## A key is sometimes missing from the JSON. How should the property be declared?
- [x] As an optional, like `String?`
- [ ] With `!`
- [ ] It cannot be decoded
Why: Missing or null keys decode to `nil` for optional properties.

## What happens when JSON does not match your type?
- [ ] The wrong fields become zero
- [x] Decoding throws an error
- [ ] The app crashes
Why: Bad data is caught where it enters your app.
