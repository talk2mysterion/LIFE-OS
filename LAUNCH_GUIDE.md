# ADAYN — setup and launch guide

## What we have changed
The application is now branded ADAYN. The account-first screen requires users to sign in or create an account, and the planner stays behind the account screen until Firebase confirms the email address is verified. Registration includes a verification email, resend action, password reset and clearer error messages.

The existing Firebase web configuration and planner storage key have been preserved. The storage key is still `lifeos_custom_v2`; do not rename it, because existing browser data may depend on it.

## 1. GitHub is the source-code home
The repository is:
https://github.com/talk2mysterion/LIFE-OS

GitHub stores the code and its history. It does not by itself configure Firebase Authentication, Firestore or production hosting. These steps are separate.

## 2. Firebase checklist (requires Firebase Console access)
1. Open https://console.firebase.google.com/ and select the existing project.
2. Open **Authentication → Sign-in method** and enable **Email/Password**.
3. Open **Authentication → Settings → Authorized domains** and add the exact hostname where ADAYN will be hosted.
4. Open **Firestore Database**. Create the database if needed.
5. Open the Firestore **Rules** tab and publish the contents of `firestore.rules`.
6. Open **Authentication → Templates → Email address verification** and confirm the verification email is enabled and its action link is valid.
7. Keep the project on the Spark plan if you want to stay within eligible no-cost quotas. Do not enable billing unless you intentionally choose a paid plan.

The Firebase web configuration in `firebase-config.js` is already populated in the repository. Preserve it. It is not a service-account credential. Never upload service-account JSON, private keys or admin credentials.

## 3. Hosting
Use GitHub as the source repository and deploy the app to a host whose terms allow the intended commercial use. Firebase Hosting or another suitable static-app host can be selected once the hosting project and deployment access are ready. Do not assume GitHub Pages is the long-term hosting choice for a commercial SaaS product.

The app must be served over HTTPS for secure sign-in and PWA installation. After deployment, add the exact hostname to Firebase Authentication's Authorized domains.

## 4. Test email verification before inviting users
- Create a test account using an email address you can access.
- Check Inbox, Spam/Junk and Promotions for the verification email.
- In Firebase Console → Authentication → Users, confirm the account exists.
- If the account exists but is unverified, return to ADAYN and choose **Resend verification email**.
- Open the verification link, return to ADAYN and choose **I've verified my email**.
- Sign out, sign in again and test password reset.
- If Firebase reports `auth/unauthorized-domain`, add the exact deployed hostname to Authorized domains.
- If Firebase reports `auth/operation-not-allowed`, enable Email/Password in Authentication.
- If the app appears stale after an update, hard-refresh the browser (Ctrl + Shift + R).

## 5. Test data and sync
- Add a test activity and goal.
- Export a JSON backup and verify that it downloads.
- Sign in on a second browser/device and confirm the same workspace appears.
- Test two different accounts and verify each account sees only its own data.
- Test Firestore rules before public launch.
- Keep manual backups. This version syncs one complete workspace document per user; simultaneous edits can overwrite the other device's latest full workspace (last-write-wins), rather than merging individual fields.

## 6. Google Calendar
Select a date in ADAYN and export its activities as an .ics file. Import it into Google Calendar and configure event notifications there. This is a one-time export, not two-way live calendar sync. Re-export after schedule changes.

## 7. Before public launch
- Publish a privacy policy and support/contact page.
- Explain local storage, cloud sync, backup, account deletion and data retention.
- Do not send journal entries, relationship notes, personal schedules or other private workspace content to advertising systems.
- Test on desktop Chrome and Android Chrome. Use the browser's **Install app** or **Add to Home screen** option to install the PWA.

## 8. Free-tier limits
The app code and PWA installation can start without a subscription. Firebase Spark includes free quotas for eligible services, but limits and provider terms can change. Domain registration, app-store distribution, payment processing and increased infrastructure usage may cost money. Do not promise users that cloud service will remain free forever.
