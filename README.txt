LIFE OS V4 — LOCAL-FIRST PERSONAL OPERATING SYSTEM
==================================================

WHAT IS INCLUDED
- Customisable life planner for different users and routines.
- Original local data key is preserved: lifeos_custom_v2. Existing V3 data is not intentionally cleared.
- Local-first saving: changes are saved to this browser immediately.
- Firebase Authentication email/password account creation, sign-in, password reset and verification email.
- Private Firestore workspace sync at users/{uid}/workspace/main.
- Sync is attempted when online; local work remains available when offline.
- Manual JSON export/import remains available.
- Export the selected day's activities as an .ics calendar file. Import it into Google Calendar and configure alerts there.
- Glassmorphism visual treatment using orange, black, white and warm neutrals.
- Lightweight PWA shell caching; no image libraries, analytics, ads or heavy frameworks.

IMPORTANT SETUP REQUIRED BEFORE ACCOUNTS WORK
The app is delivered with Firebase integration code, but it is not connected to a Firebase project yet.
1. Go to https://console.firebase.google.com/ and create a project.
2. Add a Web App to the project and copy its Firebase web configuration.
3. Open firebase-config.js and replace the four placeholder values. These are public web-app configuration values, not private service-account credentials.
4. In Firebase Authentication, enable Email/Password. Set your deployed domain under Authentication > Settings > Authorized domains.
5. In Firestore Database, create a database (production mode) and publish the contents of firestore.rules.
6. In Authentication templates, customise the verification and password-reset email wording if desired.
7. Deploy the full folder to HTTPS hosting. Test account creation, verification email, sign-in, sign-out and sync on two browsers/devices.

DATA & SYNC NOTES
- The device copy remains the immediate working copy. Cloud sync requires sign-in and an internet connection.
- When signing into an account with an existing cloud workspace, the app asks whether to load the cloud copy or upload the current device copy. Export a manual backup before choosing.
- The current cloud implementation stores one complete workspace document per user. This is simple and suitable for a small first release; large journals or extensive use may eventually require splitting data into collections. Firestore document-size limits apply, and simultaneous edits from two devices use last-write-wins behaviour rather than field-level conflict merging.
- Do not loosen Firestore rules. The supplied rules restrict each user to their own UID path.
- A user who is signed out or offline can continue using the local app. Cloud sync is not a substitute for manual backup.
- Firebase configuration in firebase-config.js is client configuration. NEVER put Firebase service-account JSON, private keys or admin credentials in this folder.

GOOGLE CALENDAR REMINDERS
1. In LIFE OS, select the date you want to plan.
2. Choose Export calendar. A .ics file is downloaded.
3. Import the file into Google Calendar (Settings > Import & export > Import), or open the file on a device with a calendar app.
4. In Google Calendar, set event notifications and ensure Android notification permissions are enabled.
Calendar notifications are provided by Google Calendar, not guaranteed by LIFE OS while it is closed. Re-import after making schedule changes; this V4 export is a one-time snapshot, not two-way live calendar sync.

ZERO-SUBSCRIPTION LAUNCH ROUTE
A. Create a public GitHub repository (for example life-os-app) and upload every file in this folder.
B. On GitHub: repository Settings > Pages > Deploy from a branch > main > /(root). Save and wait for the HTTPS github.io address.
C. In Firebase Authentication, add the exact github.io hostname to Authorized domains.
D. Add your Firebase web config to firebase-config.js, commit the file, and reload the deployed site.
E. Test on desktop Chrome and Android Chrome. Use Install app / Add to Home screen.
F. Keep the repository public for GitHub Free Pages. Do not add a custom domain, paid build service or paid API at launch.

COST & LIMITS
- The code itself has no subscription, paid library, analytics vendor or advertising SDK.
- GitHub Pages on GitHub Free is intended for public repositories and static sites; observe GitHub Pages usage limits and terms.
- Firebase Spark provides no-cost quotas for eligible services, but quotas and product eligibility can change. At quota limits, service may be throttled or unavailable. Monitor Firebase usage and do not upgrade to a paid plan unless you consciously choose to.
- “Zero naira” means a no-subscription launch using free tiers and a free subdomain, not a lifetime guarantee that every external provider will always remain free. Internet/data costs, optional domains, app-store fees and future scale are separate.
- This PWA does not require Play Store publishing. Do not promise zero storage: the app shell and user data occupy a small amount of device/browser storage.

SECURITY & PRIVACY CHECKLIST BEFORE PUBLIC LAUNCH
- Publish and verify Firestore rules.
- Add only the production hosting domain to Firebase Authorized domains.
- Test that User A cannot read User B's workspace.
- Provide a privacy policy and support contact before inviting the public.
- Explain local storage, cloud sync, backup, account deletion and data retention clearly.
- Never sell or share personal routines, journals, relationship notes or prayer notes with advertisers.

FILES
index.html              Main app and existing planner
firebase.js             Firebase Authentication + Firestore sync client
firebase-config.js      Paste your Firebase web app config here
firestore.rules         Per-user Firestore security rules
manifest.json           PWA install metadata
sw.js                   Lightweight offline app-shell cache
icon.svg                App icon
LAUNCH_GUIDE.md         Step-by-step deployment guide
