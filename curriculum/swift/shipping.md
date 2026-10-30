---
id: ship-app-store-connect
title: App Store Connect
type: xcode
minutes: 18
---
# --description--

This chapter takes an app from your Mac to the world. It needs the **Apple Developer Program** membership from here on.

**App Store Connect** ([appstoreconnect.apple.com](https://appstoreconnect.apple.com), and an app of the same name) is where you manage everything about your apps after Xcode: their store pages, builds, testers, prices, sales, ratings and reviews.

## Before your first app

- **Agreements, Tax and Banking.** Accept the Free Apps agreement to publish free apps. To sell apps or in-app purchases, also complete the Paid Apps agreement, with your bank and tax details.
- **Users and Access.** Invite people who help you, with roles that limit what they can change.

## Create the app record

Choose **Apps › +  › New App**, then give:

- the **platforms**,
- the **name** people see on the store (it must be unique on the store, and can differ from the name under the icon),
- the **primary language**,
- the **bundle ID**, which must match your Xcode target exactly,
- a **SKU**, any private reference of yours, like `HABITS1`.

## Versions and builds

Two numbers identify every upload, both set on your target's **General** tab:

- **Version** (`1.0`, `1.1`, `2.0`) is what people see on the store.
- **Build** (`1`, `2`, `3`…) must increase with every upload, even for the same version.

# --checklist--

- I accepted the agreements I need in App Store Connect.
- I created an app record whose bundle ID matches my Xcode target.
- My target has a version and a build number.

# --questions--

## What must match exactly between Xcode and App Store Connect?
- [x] The bundle ID
- [ ] The app's display name
- [ ] The SKU
Why: The bundle ID links uploads to the record.

## You upload version 1.0 build 5, find a bug, and fix it. What must change before uploading again?
- [x] The build number must increase
- [ ] The version must become 2.0
- [ ] Nothing
Why: Every upload needs a new build number.

---
id: ship-testflight
title: TestFlight
type: xcode
minutes: 18
---
# --description--

Before release, let real people try your app. **TestFlight** delivers test builds to testers' devices through Apple's TestFlight app.

## Upload a build

1. Choose **Any iOS Device** as the run destination.
2. Choose **Product › Archive**. Xcode builds a release version and opens the **Organizer**.
3. Select the archive and click **Distribute App**, then **App Store Connect**. Xcode signs it and uploads it.

After a few minutes of processing, the build appears in App Store Connect's **TestFlight** tab.

## Testers

- **Internal testers**: up to 100 members of your team in App Store Connect. They can test a build as soon as it has processed.
- **External testers**: up to 10,000 people, invited by email or with a **public link**. The first build of each version goes through a short **beta review** first.

Add **What to Test** notes so testers know what to look at. Testers send feedback with screenshots straight from the TestFlight app, and crash reports arrive in Xcode's Organizer.

Builds expire after 90 days, so testers always have something recent.

## Xcode Cloud

Uploading by hand gets old quickly. **Xcode Cloud** builds, tests and delivers your app on Apple's servers whenever you push to your Git repository. In Xcode 27, its setup connects your project to your repository and starts a first build in a few steps (**Integrate › Create Workflow**). A workflow can run your tests on every change and send each successful build to TestFlight automatically. Membership includes a monthly allowance of compute hours.

# --checklist--

- I archived my app and uploaded it to App Store Connect.
- An internal tester (or I) installed it from TestFlight.
- I set up a public TestFlight link for external testers.

# --questions--

## Who can test a build immediately, without beta review?
- [x] Internal testers on your App Store Connect team
- [ ] Everyone with the public link
- [ ] Nobody
Why: External testing starts after a short review of the version's first build.

---
id: ship-review
title: Privacy and App Review
type: lesson
minutes: 15
---
# --description--

Every app on the App Store is reviewed by people at Apple against the **App Review Guidelines**. Read them once, before you design anything big: they are clear, and most rejections come from not having read them. The most common issues:

- **Crashes and broken features.** Test the exact build you submit, on a real device.
- **Placeholder content**, or a demo that needs a login reviewers do not have. Give them a demo account in the review notes.
- **Incomplete information**: a missing privacy policy link, or screenshots that do not show the app.
- **Account deletion.** If people can create an account in your app, they must be able to delete it in your app.
- **Payments.** Digital goods sold in the app must use in-app purchase.

## Privacy

Apple takes privacy seriously, and so should you.

- **Privacy nutrition labels.** In App Store Connect you declare what data your app collects, how it is used, and whether it tracks people. Be accurate: it is shown on your store page.
- **The privacy manifest.** A file named `PrivacyInfo.xcprivacy` in your project declares the data you collect and your reasons for using certain system APIs (such as reading a file's timestamp). Third-party libraries ship their own.
- **Permission prompts.** Each request (camera, location, photos, contacts) needs a usage description in your target's Info settings, explaining in plain words why you need it.
- **Tracking.** Following people across other companies' apps and websites requires asking with App Tracking Transparency. The best answer is not to track at all.

The simplest privacy policy is the one where your app collects nothing, and many good apps can.

# --questions--

## Your app lets people create accounts. What must it also offer?
- [x] A way to delete the account from inside the app
- [ ] A paid tier
- [ ] Sign in with a phone number
Why: That is an App Store requirement.

## What is `PrivacyInfo.xcprivacy`?
- [ ] Your privacy policy web page
- [x] The privacy manifest: the data your app collects and why it uses certain APIs
- [ ] A list of your testers
Why: Apps and libraries ship one.

---
id: ship-release
title: Releasing your app
type: xcode
minutes: 20
---
# --description--

## The store page

In App Store Connect, prepare the version for submission:

- **Screenshots** for the device sizes your app supports (the current largest iPhone size is required; smaller sizes can reuse it). Show the real app, doing its best thing.
- A **description**, **keywords**, a **subtitle**, and a **support URL**.
- An **age rating**, by answering a short questionnaire.
- The **build** to release, picked from your TestFlight builds.

Then **Add for Review** and **Submit**. Most apps are reviewed within a day or two. You can release automatically when approved, or by hand, or on a date, and you can phase a release out to a growing share of users over a week.

## Mac apps outside the App Store

On the Mac you may also distribute an app yourself, from your own website. macOS trusts it if it is:

1. **Signed** with your **Developer ID Application** certificate (Xcode creates it for you),
2. built with the **Hardened Runtime** capability, and
3. **notarized**: scanned by Apple's notary service, which takes a few minutes.

In the Organizer, choose **Distribute App › Direct Distribution**: Xcode signs, uploads for notarization, and gives you a notarized app to put in a disk image or zip.

## After launch

Xcode's **Organizer** shows crashes, hangs, energy use, storage and launch time from real devices, against Xcode 27's **Metric Goals**. Read reviews and reply to them in App Store Connect. Fix what hurts most, ship small updates often, and keep the build number going up.

# --checklist--

- My store page has screenshots, a description, keywords and a support URL.
- I submitted a version for review (or I am ready to).
- For a Mac app, I tried Direct Distribution and opened the notarized app on another Mac.

# --questions--

## What three things make macOS trust an app downloaded from a website?
- [x] A Developer ID signature, the Hardened Runtime, and notarization
- [ ] An App Store listing, a price and a review
- [ ] A dark-mode icon, a menu and a window
Why: That is how Gatekeeper knows who made the app and that it was checked.

---
id: ship-quiz
title: "Quiz: shipping"
type: quiz
minutes: 3
---
# --description--

Three questions on shipping.

# --questions--

## Which menu item starts the upload of a build to App Store Connect?
- [ ] Product › Run
- [x] Product › Archive
- [ ] File › Export
Why: Archive, then Distribute App in the Organizer.

## How many external testers can TestFlight have?
- [ ] 100
- [x] 10,000
- [ ] Unlimited
Why: 100 internal and 10,000 external.

## What is a phased release?
- [x] An update rolled out automatically to a growing share of users over seven days
- [ ] A release in several countries one by one
- [ ] A beta test
Why: It limits the harm of a bug that slipped through.
