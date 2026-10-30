---
id: cloud-cloudkit
title: Syncing with iCloud
type: xcode
minutes: 20
---
# --description--

People expect their data on every device they own. With SwiftData, syncing through the person's own **iCloud** account takes a capability and a few rules, and no server of your own.

1. In your target's **Signing & Capabilities**, click **+ Capability** and add **iCloud**. Tick **CloudKit**, and add a container named like `iCloud.com.yourname.Habits`.
2. Add **Background Modes** and tick **Remote notifications**, so changes from other devices arrive quietly.
3. SwiftData syncs automatically when the app has a CloudKit container. You can also say so explicitly:

```swift
let config = ModelConfiguration(cloudKitDatabase: .automatic)
let container = try ModelContainer(for: Habit.self, configurations: config)
```

CloudKit has a few rules for models, because data from two devices must merge:

- Every property needs a default value or must be optional.
- Relationships must be optional.
- Unique constraints (`@Attribute(.unique)`) are not allowed.

So `var name: String = ""` and `var habit: Habit?`, not `var name: String` with no default.

Test on two devices signed in to the same Apple Account. Changes usually appear within seconds, but sync is not instant, and your interface should never depend on it being so.

The data lives in each person's private iCloud database. You never see it, and it does not count against any storage of yours.

> **Apple Developer Program** CloudKit needs the membership. You can view your container's schema and development data in the **CloudKit Console** at icloud.developer.apple.com.

# --checklist--

- My app has the iCloud capability with a CloudKit container.
- My models follow CloudKit's rules (defaults or optionals, optional relationships).
- A habit added on one device appears on another.

# --questions--

## Why must SwiftData properties have defaults or be optional to sync with CloudKit?
- [x] Records arrive from other devices piece by piece, so every property must have a value it can start with
- [ ] CloudKit cannot store strings
- [ ] To save space
Why: Merging data from several devices needs safe starting values.

---
id: cloud-sign-in
title: Sign in with Apple
type: xcode
minutes: 15
---
# --description--

If your app has accounts, **Sign in with Apple** gives people a private, one-tap way to sign in. They can hide their real email address behind a relay address, and the App Store requires it as an option whenever you offer other third-party sign-in services.

Add the **Sign in with Apple** capability, then use the button:

```swift
import AuthenticationServices

SignInWithAppleButton(.signIn) { request in
    request.requestedScopes = [.fullName, .email]
} onCompletion: { result in
    switch result {
    case .success(let authorization):
        if let credential = authorization.credential as? ASAuthorizationAppleIDCredential {
            account.signIn(userID: credential.user, name: credential.fullName)
        }
    case .failure(let error):
        print("Sign in failed: \(error.localizedDescription)")
    }
}
.signInWithAppleButtonStyle(.black)
.frame(height: 50)
```

`credential.user` is a stable identifier for this person in your app. The name and email arrive **only the first time** someone signs in, so save them then.

On a later launch, check the credential is still valid with `ASAuthorizationAppleIDProvider().credentialState(forUserID:)`. People can stop using Sign in with Apple for your app from their device's settings.

> **Note** Many apps need no accounts at all. If iCloud sync gives people their data everywhere, you may not need sign-in, and that is better for everyone's privacy.

# --questions--

## When does Sign in with Apple give you the person's name and email?
- [x] Only the first time they sign in to your app
- [ ] Every time
- [ ] Never
Why: Save them on the first sign-in.

---
id: cloud-storekit
title: In-app purchases with StoreKit
type: xcode
minutes: 25
---
# --description--

**StoreKit** sells digital things inside your app: a one-time unlock, a consumable such as extra credits, or a subscription. Apple handles payment, receipts and refunds.

## Test without the App Store

Choose **File › New › File › StoreKit Configuration File**. Add products there, with IDs like `com.yourname.habits.supporter`, and select the file in your scheme (**Product › Scheme › Edit Scheme › Run › Options › StoreKit Configuration**). Purchases now work in the simulator, with no money involved.

## Show products

SwiftUI has ready-made store views that handle loading, prices in the local currency, and purchasing:

```swift
import StoreKit

ProductView(id: "com.yourname.habits.supporter")
    .productViewStyle(.large)

SubscriptionStoreView(groupID: "21500000")   // your subscription group's ID
    .storeButton(.visible, for: .restorePurchases)
```

## Check what someone owns

Your app decides what to unlock from the person's **entitlements**: the verified transactions they currently own.

```swift
@Observable
final class Store {
    var isSupporter = false

    func refresh() async {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               transaction.productID == "com.yourname.habits.supporter" {
                isSupporter = true
            }
        }
    }

    func listenForUpdates() async {
        for await result in Transaction.updates {
            if case .verified(let transaction) = result {
                await transaction.finish()
                await refresh()
            }
        }
    }
}
```

Start `listenForUpdates()` when the app launches, so purchases made elsewhere (another device, a family member, a refund) are noticed. Always `finish()` a transaction once you have delivered what was bought.

> **Apple Developer Program** Selling on the App Store needs the membership, the Paid Apps Agreement in App Store Connect, and your products created there with the same IDs as in your configuration file.

# --checklist--

- My app has a StoreKit configuration file with a supporter product.
- A `ProductView` shows it, and buying it in the simulator unlocks a thank-you badge.
- The unlock survives relaunching, because it comes from current entitlements.

# --questions--

## Where should your app learn what someone has bought?
- [x] From `Transaction.currentEntitlements`, which contains verified transactions
- [ ] From a `Bool` saved in `@AppStorage`
- [ ] From the price shown
Why: Entitlements are verified, and they handle refunds and other devices.

## How do you test purchases without real money?
- [ ] You cannot
- [x] With a StoreKit configuration file selected in the scheme
- [ ] By setting the price to zero
Why: The local configuration simulates the App Store.

---
id: cloud-quiz
title: "Quiz: iCloud and the store"
type: quiz
minutes: 3
---
# --description--

Three questions on iCloud, sign-in and purchases.

# --questions--

## Whose storage does a SwiftData app's private CloudKit data use?
- [x] Each person's own iCloud account
- [ ] Your developer account
- [ ] A server you rent
Why: Private databases belong to the user.

## What must you call after delivering a purchase?
- [ ] `refund()`
- [x] `transaction.finish()`
- [ ] Nothing
Why: Unfinished transactions are delivered again.

## When must an app offer Sign in with Apple?
- [x] When it offers other third-party sign-in options, such as another company's account
- [ ] Always
- [ ] Never
Why: It is an App Store requirement in that case.
