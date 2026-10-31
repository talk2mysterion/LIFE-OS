ADAYN — PERSONAL PLANNING AND LIFE-MANAGEMENT APP
================================================

WHAT IS INCLUDED
- Customisable life planner for different users and routines.
- Existing planner storage key is preserved: lifeos_custom_v2. Do not rename or delete it during this rebrand.
- Local-first saving: changes are saved to this browser immediately after account access.
- Account-first entry screen with Firebase email/password registration, sign-in, password reset, verification email, resend verification and verified-email gate.
- Private Firestore workspace sync at users/{uid}/workspace/main.
- Manual JSON export/import remains available.
- Export the selected day's activities as an .ics calendar file for import into Google Calendar.
- Orange, black and white identity with a glass-inspired interface.
- Lightweight installable PWA shell; no analytics or advertising SDK.

IMPORTANT: FIREBASE MUST BE CONFIGURED
This repository already contains firebase-config.js for the existing Firebase web project. Preserve those values. Do not replace them with placeholders, and never add a Firebase service-account JSON file or private admin key.
1. In Firebase Authentication, enable Email/Password.
2. Confirm the deployed app hostname is listed under Authentication → Settings → Authorized domains.
3. In Firestore Database, create a database if one does not exist and publish firestore.rules.
4. In Authentication → Templates, confirm the Email address verification template is enabled.
5. Deploy to an HTTPS host and test registration, verification email, sign-in, sign-out and sync on two devices.

DATA & SYNC NOTES
- The planner is shown only after sign-in with a verified email.
- The existing local data key remains lifeos_custom_v2 so the rebrand does not intentionally erase existing browser data.
- When signing into an account with an existing cloud workspace, the app asks whether to load the cloud copy or upload the current device copy. Export a manual backup before choosing.
- The current cloud implementation stores one complete workspace document per user. Large journals may eventually require splitting data into collections. Firestore document-size limits apply, and simultaneous edits from two devices use last-write-wins behaviour rather than field-level conflict merging.
- Do not loosen Firestore rules. The supplied rules restrict each user to their own UID path.
- Firebase web configuration is client configuration. Never put service-account JSON, private keys or admin credentials in this repository.

GOOGLE CALENDAR
ADAYN exports a selected day's activities as an .ics file. Import that file into Google Calendar and configure event notifications there. This is a one-time export, not two-way live calendar sync.

HOSTING AND COST
- GitHub is the source-code repository and version history.
- Do not assume GitHub Pages is the right long-term host for a commercial SaaS product. Select a hosting provider whose terms permit the intended commercial use.
- Firebase Spark has free quotas for eligible services, but quotas and provider terms can change. Monitor usage; no free tier is a lifetime cost guarantee.
- A free provider subdomain can be used initially. A custom domain and Play Store publication are optional later costs.
- PWA installation from a supported browser is available without Play Store publication.

PRIVACY AND PUBLIC LAUNCH CHECKLIST
- Publish a plain-language privacy policy and support contact before inviting the public.
- Test that User A cannot read User B's workspace.
- Explain local storage, cloud sync, backup, account deletion and data retention clearly.
- Keep journals, personal schedules, relationship notes and other private workspace content out of advertising systems.

FILES
index.html          Main app and existing planner
firebase.js         Firebase Authentication + Firestore sync client
firebase-config.js  Existing Firebase web app config (preserve)
firestore.rules     Per-user Firestore security rules
manifest.json       PWA install metadata
sw.js               Lightweight offline app-shell cache
icon.svg            ADAYN app icon
LAUNCH_GUIDE.md     Deployment and verification guide

V1 rebrand: ADAYN replaces the LIFE OS public-facing brand. The internal local-storage key is intentionally unchanged for data continuity.
