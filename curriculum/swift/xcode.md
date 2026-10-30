---
id: xcode-program
title: The Apple Developer Program
type: lesson
minutes: 10
---
# --description--

You now know Swift. The rest of the course is about building apps with it, using the tools Apple gives developers. This lesson explains what you need, and what you get from the **Apple Developer Program**.

## What is free

With nothing but a free Apple Account you can:

- download **Xcode** and everything in it: the editor, the simulators, Instruments, the documentation;
- build and run apps in the **simulator** for every Apple platform;
- run your own apps on **your own** iPhone, iPad or Mac. Apps signed with a free account stop working after seven days and need rebuilding, and some capabilities are not available.

That is enough for most of this course.

## What the membership adds

The Apple Developer Program costs **US $99 a year** (prices vary by country, and fee waivers exist for eligible non-profits, schools and government bodies). It adds everything you need to put apps in other people's hands:

| You get | What it is for |
| --- | --- |
| **App Store distribution** | Sell or give away apps on every Apple platform |
| **TestFlight** | Send test builds to up to 10,000 testers before release |
| **App Store Connect** | Manage your apps, pricing, reviews, sales and analytics |
| **Capabilities** | iCloud and CloudKit, push notifications, in-app purchases, Apple Pay, Sign in with Apple, App Groups and more |
| **Developer ID** | Sign and notarize Mac apps you distribute yourself, outside the App Store |
| **Xcode Cloud** | Build and test in the cloud on every change, with compute hours included |
| **Beta software** | Early access to new versions of iOS, macOS and Xcode |
| **Code-level support** | Ask Apple's engineers for help with a technical problem |

## Enrolling

You enrol as an **individual** (apps appear under your own name) or an **organisation** (apps appear under a company name, which needs a D-U-N-S number, a free business identifier). Enrol at [developer.apple.com/programs](https://developer.apple.com/programs/enroll/) or in the **Apple Developer** app, with an Apple Account that has two-factor authentication turned on.

> **Apple Developer Program** You do not need to join yet. Chapter 9, where you ship an app, is the first place it is required. If you are already a member, everything in this course works with your account.

# --questions--

## What can you do with only a free Apple Account?
- [x] Build apps and run them in the simulator and on your own devices
- [ ] Publish apps on the App Store
- [ ] Use TestFlight
Why: Distribution and several capabilities need the membership.

## You want to sell a Mac app from your own website, not the App Store. What do you need from the program?
- [ ] Nothing: Mac apps need no signing
- [x] A Developer ID certificate, to sign and notarize the app
- [ ] TestFlight
Why: macOS trusts downloaded apps that are signed with Developer ID and notarized by Apple.

---
id: xcode-install
title: Installing Xcode 27
type: xcode
minutes: 15
---
# --description--

**Xcode** is Apple's app for writing software for every Apple platform. It holds the code editor, the interface previews, the simulators, the debugger, the testing tools and the tools that ship your app.

1. Open the **Mac App Store**, search for **Xcode**, and click **Get**. It is large, so give it time.
2. Open Xcode. On first launch it installs extra components and asks which **platforms** you want. Choose **iOS** and **macOS** to start; you can add more later in **Xcode › Settings › Components**.
3. Sign in with your Apple Account in **Xcode › Settings › Accounts**, with the **+** button. If you are a Developer Program member, your team appears here.

Xcode needs a recent version of macOS; the App Store tells you if your Mac's is too old to install it. To check which Xcode you have, choose **Xcode › About Xcode**.

> **Tip** If you also use Terminal, Xcode's command-line tools come with it. Run `xcode-select -p` to check which developer tools Terminal is using; `sudo xcode-select -s /Applications/Xcode.app` points it at Xcode.

## Try a playground right away

Xcode 27 can open a single Swift file as a playground, without a project. Choose **File › New › Playground**, type some Swift, and watch the results appear beside each line. It is the quickest way to try an idea, just like the editor on this site, but with Apple's frameworks available.

# --checklist--

- Xcode 27 is installed and opens.
- The iOS and macOS platforms are installed.
- My Apple Account is signed in under Settings › Accounts.
- I made a playground and saw results beside my code.

# --questions--

## Where do you add support for another platform, like watchOS, after installing Xcode?
- [ ] By reinstalling Xcode
- [x] Xcode › Settings › Components
- [ ] In the Mac App Store
Why: Platforms download on demand from Settings.

---
id: xcode-tour
title: A tour of Xcode
type: xcode
minutes: 20
---
# --description--

Make your first project, then look around.

1. Choose **File › New › Project**, pick **iOS › App**, and click **Next**.
2. Name it `Hello`. Set **Interface** to **SwiftUI** and **Testing System** to **Swift Testing**. For **Organization Identifier** use something you control in reverse-domain order, like `com.yourname`; your app's **bundle identifier** becomes `com.yourname.Hello`, and must be unique on the App Store.
3. Save it somewhere you will find again.

> **Tip** Xcode 27 can also start an **untitled project** with no questions asked. It is perfect for experiments: name and save it later, or throw it away.

## The window

| Area | Where | What it is for |
| --- | --- | --- |
| **Navigator** | Left (⌘0 shows or hides it) | Your files (⌘1), searching (⌘3), problems (⌘5), tests (⌘6) |
| **Editor** | Middle | Your code |
| **Canvas** | Beside the editor (⌥⌘↩) | Live previews of your SwiftUI views |
| **Inspector** | Right (⌥⌘0) | Details about whatever is selected |
| **Debug area** | Bottom (⇧⌘Y) | Your app's output and the debugger |
| **Toolbar** | Top | The **Run** button, the run destination and the status |

Xcode 27's toolbar can be customised: right-click it to add, remove or reorder items.

## Run it

Choose an iPhone simulator from the run destination menu in the toolbar, and press **Run** (⌘R). Xcode builds your app and launches it in **Device Hub**, Xcode 27's home for simulators and real devices. Its toolbar has Home, screenshot and rotate buttons, and its inspector lets you try larger text, dark mode and increased contrast.

## Ask for help

Xcode 27 includes a coding assistant. Open a conversation with it, describe what you want, and use `/plan` to have it propose an approach before it changes anything. It can be a fine tutor: ask it to *explain* code you do not understand. But type the course's code yourself; that is how it sticks.

# --checklist--

- I made a SwiftUI iOS project called Hello with my own organisation identifier.
- I found the navigator, editor, canvas, inspector and debug area.
- I ran the app in an iPhone simulator with ⌘R.
- In Device Hub, I took a screenshot and tried dark mode.

# --questions--

## What is a bundle identifier?
- [x] A unique reverse-domain name for your app, like `com.yourname.Hello`
- [ ] The name shown under the app's icon
- [ ] Your Apple Account email
Why: It identifies the app to Apple's systems and must be unique.

## Which shortcut builds and runs your app?
- [ ] ⌘B
- [x] ⌘R
- [ ] ⌘U
Why: ⌘B only builds; ⌘U runs tests.

---
id: xcode-device
title: Running on your iPhone
type: xcode
minutes: 15
---
# --description--

The simulator is excellent, but nothing beats holding your app. To run it on your own iPhone:

1. Connect the iPhone to your Mac with a cable, unlock it, and tap **Trust** if asked. After the first time, it can connect over Wi-Fi.
2. On the iPhone, turn on **Developer Mode**: **Settings › Privacy & Security › Developer Mode**, then restart when asked. (The option appears after you connect the phone to Xcode.)
3. In Xcode, select your project at the top of the navigator, then your app's **target**, then the **Signing & Capabilities** tab. Make sure **Automatically manage signing** is on, and pick your **Team** (your name, or your Developer Program team).
4. Choose your iPhone as the run destination and press ⌘R.

## What signing is

Apple devices only run apps that are **signed**: stamped with a certificate that proves who built them, plus a **provisioning profile** saying which devices may run the app and which capabilities it may use. With automatic signing, Xcode creates and renews all of this for you. You will meet certificates again when you ship.

If something goes wrong, the message usually names the problem: a bundle identifier someone else already uses (change yours), a device that is not registered (Xcode offers to register it), or a capability your account type does not include.

Your phone also appears in **Device Hub**, where you can watch and control the running app from your Mac.

# --checklist--

- Developer Mode is on, on my iPhone.
- My app's target signs automatically with my team.
- The Hello app runs on my own iPhone.

# --questions--

## What does a provisioning profile say?
- [ ] How much the app costs
- [x] Which app, which devices and which capabilities are allowed
- [ ] Which Swift version to use
Why: It ties your certificate, your app's identifier, devices and capabilities together.

## Xcode says the bundle identifier is not available. What is the fix?
- [x] Change it to something unique, like one using your own domain or name
- [ ] Reinstall Xcode
- [ ] Turn off signing
Why: Identifiers are unique across every developer.
