---
id: net-urlsession
title: Fetching data with URLSession
type: lesson
minutes: 12
---
# --description--

Most apps talk to a server. Combine three things you already know, async/await, Codable and errors, with `URLSession`, and it takes a few lines:

```swift
struct Quote: Codable {
    let text: String
    let author: String
}

func fetchQuote() async throws -> Quote {
    let url = URL(string: "https://example.com/api/quote")!
    let (data, response) = try await URLSession.shared.data(from: url)
    guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
        throw URLError(.badServerResponse)
    }
    return try JSONDecoder().decode(Quote.self, from: data)
}
```

Step by step:

1. `URL(string:)` returns an optional. Here the address is our own, written in the code, so force unwrapping it is reasonable: a mistake would be a bug, found the first time the code runs.
2. `data(from:)` downloads the response. It is `async` because it waits on the network, and `throws` because the network can fail.
3. Check the **status code**: 200 to 299 means success; 404 means not found; 500 means the server failed.
4. Decode the JSON into your type.

App Transport Security requires `https` addresses by default, so your users' data is always encrypted on the way.

For anything other than a simple download, build a `URLRequest`:

```swift
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = try JSONEncoder().encode(newPost)
let (data, _) = try await URLSession.shared.data(for: request)
```

> **Note** `URLSession` works on Linux too, but this site's exercises cannot reach the internet, so this lesson's practice happens in Xcode.

# --questions--

## Why is `URLSession.shared.data(from:)` both `async` and `throws`?
- [x] It waits for the network, and the network can fail
- [ ] It always fails
- [ ] So it can run on the main actor
Why: Networking is slow and unreliable; Swift makes both facts visible.

## A server answers with status code 404. What does it mean?
- [ ] Success
- [x] Not found
- [ ] The server crashed
Why: 2xx is success, 4xx is a problem with the request, 5xx a problem on the server.

---
id: net-screen
title: A screen that loads
type: xcode
minutes: 20
---
# --description--

A screen that loads data has states: loading, loaded, failed. Model them with an enum, as you learned in Enums, and the view becomes a simple `switch`:

```swift
enum LoadState<Value> {
    case loading
    case loaded(Value)
    case failed(String)
}

struct QuoteView: View {
    @State private var state: LoadState<Quote> = .loading

    var body: some View {
        Group {
            switch state {
            case .loading:
                ProgressView()
            case .loaded(let quote):
                VStack(spacing: 12) {
                    Text("“\(quote.text)”").font(.title2)
                    Text(quote.author).foregroundStyle(.secondary)
                }
            case .failed(let message):
                ContentUnavailableView {
                    Label("Couldn’t load", systemImage: "wifi.exclamationmark")
                } description: {
                    Text(message)
                } actions: {
                    Button("Try again") { Task { await load() } }
                }
            }
        }
        .padding()
        .task { await load() }
        .refreshable { await load() }
    }

    func load() async {
        do {
            state = .loaded(try await fetchQuote())
        } catch {
            state = .failed(error.localizedDescription)
        }
    }
}
```

`.task` starts the work when the view appears, and cancels it if the view goes away first. `.refreshable` adds pull to refresh. Because the view is on the main actor, updating `state` after the `await` is safe.

## Images from the web

`AsyncImage` downloads and shows an image, with a placeholder while it loads:

```swift
AsyncImage(url: photoURL) { image in
    image.resizable().scaledToFill()
} placeholder: {
    ProgressView()
}
.frame(width: 80, height: 80)
.clipShape(.circle)
```

In iOS 27 and macOS 27, `AsyncImage` respects standard HTTP cache headers by default, so images are not downloaded twice.

# --instructions--

Build a screen that loads a list from a public JSON API of your choice (try a list of books, countries or recipes) into a `List`, with loading, failed and loaded states, pull to refresh, and an `AsyncImage` per row if the API has images.

# --checklist--

- My screen shows a `ProgressView` while loading.
- With Wi-Fi off, it shows a helpful error with a Try again button.
- Pull to refresh reloads the data.

# --questions--

## Why use `.task` rather than `.onAppear { Task { … } }`?
- [x] `.task` cancels the work automatically if the view disappears
- [ ] `.onAppear` does not run
- [ ] `.task` is faster
Why: Structured concurrency, tied to the view's lifetime.

---
id: net-quiz
title: "Quiz: networking"
type: quiz
minutes: 3
---
# --description--

Three questions on networking.

# --questions--

## Why model a loading screen with an enum?
- [x] Each state carries exactly its data, and the view switches over them all
- [ ] Enums download faster
- [ ] SwiftUI requires it
Why: Impossible combinations cannot exist.

## Why does iOS require `https` addresses by default?
- [ ] They are faster
- [x] So data is encrypted on its way between the device and the server
- [ ] `http` is not a real protocol
Why: App Transport Security protects your users.

## What does `.refreshable` add?
- [ ] A timer
- [x] Pull to refresh
- [ ] Automatic saving
Why: It runs your async closure when the person pulls down.
