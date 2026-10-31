# LIFE OS V4 — zero-subscription launch guide

## 1. What you can launch for free

The first release is a static installable PWA. Publish it on GitHub Pages using a public repository and its free `github.io` address. Use Firebase's Spark (no-cost) plan for eligible email authentication and Firestore usage. Do not add a custom domain, paid hosting, a paid API or Play Store distribution for the first release.

Free tiers have quotas and provider terms can change. This is a no-subscription launch plan, not a promise of zero costs forever. If a Firebase quota is exhausted, cloud features may stop until the quota resets; local use and manual backups remain available.

## 2. Prepare Firebase

1. Visit <https://console.firebase.google.com/> and create a project.
2. Register a Web App inside the project.
3. Copy the web configuration values into `firebase-config.js` (`apiKey`, `authDomain`, `projectId`, `appId`). These values identify the public web app. Never paste a service-account JSON file or private key.
4. Open **Authentication → Sign-in method** and enable **Email/Password**.
5. Open **Authentication → Settings → Authorized domains** and add the exact hostname that GitHub Pages will use, such as `yourname.github.io`.
6. Open **Firestore Database** and create a database. After it is created, open the Rules tab and publish the contents of `firestore.rules` from this folder.
7. Confirm the project remains on the Spark plan. Do not enable billing/Blaze for this zero-subscription launch.

## 3. Publish on GitHub Pages

1. Sign in to GitHub and create a **public** repository named `life-os-app`.
2. Upload all files in this folder, keeping them at the repository root: `index.html`, `manifest.json`, `sw.js`, `icon.svg`, `firebase.js`, `firebase-config.js`, `firestore.rules`, `README.txt`, and this guide.
3. Commit the files to the `main` branch.
4. Open repository **Settings → Pages**.
5. Under Build and deployment, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
6. Wait for GitHub Pages to publish. Open the HTTPS URL shown in Pages.
7. Add the published hostname to Firebase Authentication's Authorized domains.
8. Reload the website. The account status should move from “Firebase setup pending” to “Ready”.

## 4. Test before inviting users

- Create a test account using an email you control. Confirm the verification email arrives.
- Sign out, sign in again and test password reset.
- Add a test activity and goal. Confirm local use works after switching the device to airplane mode.
- Sign back in online. Confirm the sync indicator reports that cloud sync is connected.
- Open the same account on a second browser/device. Confirm the workspace appears there.
- Test with two different accounts and verify each account sees only its own data.
- Export a JSON backup, then test importing it into a separate test profile/browser.
- Export an `.ics` file and import it into a test Google Calendar. Set a test notification and verify it reaches the device.

## 5. Google Calendar reminders

LIFE OS exports the selected day's tasks as a calendar file. It does not yet maintain a two-way Google Calendar connection. Import the `.ics` file into Google Calendar, then configure event notifications in Google Calendar and allow notifications on Android. If a task changes later, export and import the updated calendar file again; avoid importing duplicates repeatedly.

## 6. Privacy and public launch readiness

Before public promotion, write a plain-language privacy policy and support/contact page. Explain that data is stored locally and, when signed in, synced to Firebase. Explain how users can export backups and request account/data deletion. Test Firestore access rules with two accounts. Never publish private credentials. Keep journals, prayer notes, relationships and personal schedules private; do not send this content to ad platforms.

## 7. Storage and performance

The app is a small static PWA. It caches only its local app shell and uses browser local storage for the workspace. It cannot consume literally zero storage: installed app files, cached files and user data need some space. Keep images and external libraries out of the first release to keep it lean.

## 8. Current V4 sync limitation

V4 syncs one workspace document per user. This keeps the first release small and simple, but Firestore document-size limits apply. If two devices edit at nearly the same time, the most recently synced complete workspace can replace the other copy; this version does not yet merge individual fields. Encourage users to avoid editing the same account simultaneously on multiple devices and retain manual backups. A later scale-up should split routines, journal entries, goals and daily records into separate documents with conflict-aware timestamps.
