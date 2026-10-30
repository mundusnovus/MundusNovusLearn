---
id: project-library
title: "Project: a library system"
type: project
minutes: 60
---
# --description--

This is the project for the Modelling with types chapter. It uses structs, classes, enums, protocols and errors together, the way a real program does.

You are building the core of a lending library: the members, the books, and the rules for borrowing and returning. There is no step-by-step guide. Plan it on paper first: which things are values, which thing is shared, and what can go wrong?

When every test passes, you have a solid foundation in modelling with Swift's types.

# --instructions--

**User stories**

1. A `Book` struct has an `isbn` (`String`), a `title` (`String`) and an `author` (`String`). Books are `Hashable`.
2. A `Member` struct has an `id` (`Int`), a `name` (`String`) and a `tier`, an enum `Tier` with the cases `standard` and `premium`.
3. `Tier` has a computed property `loanLimit`: `3` for standard members and `10` for premium.
4. An enum `LibraryError: Error` has the cases `unknownBook`, `unknownMember`, `alreadyOnLoan`, `notOnLoan` and `limitReached(limit: Int)`.
5. A `final class Library` holds the catalogue and the loans. It has:
   - `func add(_ book: Book)` and `func register(_ member: Member)`,
   - `func lend(isbn: String, to memberID: Int) throws(LibraryError)`, which throws the right error for an unknown book or member, a book already on loan, or a member at their limit,
   - `func giveBack(isbn: String) throws(LibraryError)`, which throws `notOnLoan` if the book was not on loan (or `unknownBook` if the library does not have it),
   - `func books(on memberID: Int) -> [Book]`: the books a member has, sorted by title,
   - `var available: [Book]`: every book not on loan, sorted by title.
6. Lending and returning must keep the library consistent: a book is on loan to at most one member at a time.

# --tests--

Premium members should be able to borrow 10 books, and standard members 3.

```swift
expect(Tier.premium.loanLimit == 10 && Tier.standard.loanLimit == 3)
```

Lending should move a book from `available` to the member's books.

```swift
let lib = Library()
lib.add(Book(isbn: "1", title: "Dune", author: "Herbert"))
lib.add(Book(isbn: "2", title: "Emma", author: "Austen"))
lib.register(Member(id: 7, name: "Ana", tier: .standard))
try? lib.lend(isbn: "1", to: 7)
expect(lib.books(on: 7).map(\.title) == ["Dune"] && lib.available.map(\.title) == ["Emma"])
```

Lending an unknown book or to an unknown member should throw the right error.

```swift
let lib = Library()
lib.add(Book(isbn: "1", title: "Dune", author: "Herbert"))
lib.register(Member(id: 7, name: "Ana", tier: .standard))
var e1: LibraryError? = nil, e2: LibraryError? = nil
do { try lib.lend(isbn: "9", to: 7) } catch { e1 = error }
do { try lib.lend(isbn: "1", to: 99) } catch { e2 = error }
if case .unknownBook = e1, case .unknownMember = e2 { expect(true) } else { expect(false) }
```

A book on loan should not be lent again.

```swift
let lib = Library()
lib.add(Book(isbn: "1", title: "Dune", author: "Herbert"))
lib.register(Member(id: 1, name: "Ana", tier: .standard))
lib.register(Member(id: 2, name: "Ben", tier: .standard))
try? lib.lend(isbn: "1", to: 1)
var e: LibraryError? = nil
do { try lib.lend(isbn: "1", to: 2) } catch { e = error }
if case .alreadyOnLoan = e { expect(lib.books(on: 2).isEmpty) } else { expect(false) }
```

A standard member should be stopped at 3 books, with the limit in the error.

```swift
let lib = Library()
for i in 1...4 { lib.add(Book(isbn: String(i), title: "Book \(i)", author: "A")) }
lib.register(Member(id: 1, name: "Ana", tier: .standard))
for i in 1...3 { try? lib.lend(isbn: String(i), to: 1) }
var e: LibraryError? = nil
do { try lib.lend(isbn: "4", to: 1) } catch { e = error }
if case .limitReached(let limit) = e { expect(limit == 3 && lib.books(on: 1).count == 3) } else { expect(false) }
```

Returning a book should make it available again, and returning it twice should throw `notOnLoan`.

```swift
let lib = Library()
lib.add(Book(isbn: "1", title: "Dune", author: "Herbert"))
lib.register(Member(id: 1, name: "Ana", tier: .premium))
try? lib.lend(isbn: "1", to: 1)
try? lib.giveBack(isbn: "1")
var e: LibraryError? = nil
do { try lib.giveBack(isbn: "1") } catch { e = error }
if case .notOnLoan = e { expect(lib.available.count == 1 && lib.books(on: 1).isEmpty) } else { expect(false) }
```

`lend` and `giveBack` should use typed throws, and `Library` should be a final class.

```source
final\s+class\s+Library
```

```source
func\s+lend[^{]*throws\s*\(\s*LibraryError\s*\)
```

```source
func\s+giveBack[^{]*throws\s*\(\s*LibraryError\s*\)
```

# --seed--

```swift
// Plan first: which things are values, which is shared, and what can go wrong?

```

# --solution--

```swift
struct Book: Hashable {
    let isbn: String
    let title: String
    let author: String
}

enum Tier {
    case standard, premium

    var loanLimit: Int {
        switch self {
        case .standard: 3
        case .premium: 10
        }
    }
}

struct Member {
    let id: Int
    let name: String
    let tier: Tier
}

enum LibraryError: Error {
    case unknownBook, unknownMember, alreadyOnLoan, notOnLoan
    case limitReached(limit: Int)
}

final class Library {
    private var catalogue: [String: Book] = [:]
    private var members: [Int: Member] = [:]
    private var loans: [String: Int] = [:]   // isbn -> member id

    func add(_ book: Book) { catalogue[book.isbn] = book }
    func register(_ member: Member) { members[member.id] = member }

    func lend(isbn: String, to memberID: Int) throws(LibraryError) {
        guard catalogue[isbn] != nil else { throw .unknownBook }
        guard let member = members[memberID] else { throw .unknownMember }
        guard loans[isbn] == nil else { throw .alreadyOnLoan }
        let count = loans.values.filter { $0 == memberID }.count
        guard count < member.tier.loanLimit else { throw .limitReached(limit: member.tier.loanLimit) }
        loans[isbn] = memberID
    }

    func giveBack(isbn: String) throws(LibraryError) {
        guard catalogue[isbn] != nil else { throw .unknownBook }
        guard loans[isbn] != nil else { throw .notOnLoan }
        loans[isbn] = nil
    }

    func books(on memberID: Int) -> [Book] {
        loans.filter { $0.value == memberID }.compactMap { catalogue[$0.key] }.sorted { $0.title < $1.title }
    }

    var available: [Book] {
        catalogue.values.filter { loans[$0.isbn] == nil }.sorted { $0.title < $1.title }
    }
}
```

# --hints--

- A dictionary from ISBN to member ID is a simple way to record loans. It makes "on loan to at most one member" true by construction.
- Count a member's loans with `loans.values.filter { $0 == memberID }.count`.
