import { firebaseConfig } from './firebase-config.js';

const $ = id => document.getElementById(id);
const configured = Boolean(firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('PASTE_') && firebaseConfig.projectId && firebaseConfig.projectId !== 'YOUR_PROJECT_ID' && firebaseConfig.appId && !firebaseConfig.appId.startsWith('PASTE_'));
const LOCAL_KEY = 'lifeos_custom_v2'; // Preserve existing planner data.
let auth, cloudDb, activeUser = null, unsubscribe = null, pending = null, timer = null, applyingRemote = false, activeUid = null, busy = false;
const status = message => { $('authStatus').textContent = message; };
const setAppVisible = (yes, email='') => {
  document.body.classList.toggle('authenticated', yes);
  $('authModal').classList.toggle('hidden', yes);
  $('closeAuth').classList.toggle('hidden', !yes);
  $('signOutBtn').classList.toggle('hidden', !yes);
  if (yes) { $('accountBtn').textContent = email || 'My account'; $('syncState').textContent = 'Signed in · syncing'; }
  else { $('accountBtn').textContent = 'Sign in'; }
};
const setBusy = (yes, buttonId) => {
  busy = yes;
  ['signInBtn','signUpBtn','resetPasswordBtn','checkVerificationBtn','resendVerificationBtn'].forEach(id => { if ($(id)) $(id).disabled = yes; });
  if (buttonId) {
    const labels = {signInBtn:'Sign in',signUpBtn:'Create account',resendVerificationBtn:'Resend verification email',checkVerificationBtn:"I've verified my email",resetPasswordBtn:'Forgot password?'};
    $(buttonId).textContent = yes ? 'Please wait…' : labels[buttonId];
  }
};
function mode(which) {
  $('authForm').classList.remove('hidden'); $('verifyPanel').classList.add('hidden'); $('firebaseSetupHint').classList.add('hidden');
  $('authTabs').classList.remove('hidden');
  $('showSignIn').classList.toggle('active', which === 'signin'); $('showSignUp').classList.toggle('active', which === 'signup');
  $('signInBtn').classList.toggle('hidden', which !== 'signin'); $('signUpBtn').classList.toggle('hidden', which !== 'signup');
  $('resetPasswordBtn').classList.toggle('hidden', which !== 'signin');
  $('authTitle').textContent = which === 'signin' ? 'Welcome back.' : 'Create your account.';
  $('authMessage').textContent = which === 'signin' ? 'Sign in to continue to your workspace.' : 'A few details, then your personal space is ready.';
  $('authPassword').autocomplete = which === 'signin' ? 'current-password' : 'new-password';
  status(which === 'signin' ? 'Enter your email and password to continue.' : 'Use an email address you can open. We will send a verification link.');
}
function showVerification(email) {
  $('authTabs').classList.add('hidden'); $('authForm').classList.add('hidden'); $('verifyPanel').classList.remove('hidden');
  $('verifyEmailLabel').textContent = 'We sent a verification link to ' + (email || 'your email address') + '. Open it, click Verify, then return here.';
  status('Your account is not active until your email is verified.');
  setAppVisible(false);
}
function localData() { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}'); } catch { return {}; } }
function setLocal(data) { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); }
function state(label, detail) { $('syncState').textContent = label; $('accountDetails').textContent = detail; }
function friendly(e) {
  const code = e && e.code || '';
  const map = {
    'auth/invalid-credential':'That email/password combination was not recognised. Check both and try again.',
    'auth/email-already-in-use':'This email already has an account. Choose Sign in instead.',
    'auth/weak-password':'Your password must contain at least 6 characters.',
    'auth/invalid-email':'That email address does not look valid. Check for typing mistakes.',
    'auth/operation-not-allowed':'Email/password sign-in is not enabled in Firebase Authentication.',
    'auth/too-many-requests':'Too many attempts. Wait a little before trying again.',
    'auth/network-request-failed':'The internet connection failed. Check your connection and try again.',
    'auth/unauthorized-domain':'This website address is not authorised in Firebase. Add its hostname under Authentication → Settings → Authorized domains.',
    'auth/invalid-api-key':'The Firebase API key is incorrect. Recheck firebase-config.js.',
    'auth/app-not-authorized':'This website is not authorised for this Firebase project. Check the Firebase web app and authorised domains.',
    'auth/user-disabled':'This account has been disabled.',
    'auth/user-not-found':'No account was found for this email. Create an account first.',
    'auth/wrong-password':'The password is incorrect. Try again or reset it.',
    'permission-denied':'Firebase blocked the cloud save. Check that the published Firestore rules match firestore.rules.'
  };
  return map[code] || (e && e.message) || 'Something went wrong. Please try again.';
}
async function connectCloud(u, modules) {
  if (activeUid === u.uid) { setAppVisible(true, u.email); return; }
  activeUid = u.uid; activeUser = u;
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  state('Connecting cloud sync…', u.email || 'Signed in');
  const {doc,getDoc,setDoc,onSnapshot,serverTimestamp} = modules;
  const ref = doc(cloudDb, 'users', u.uid, 'workspace', 'main');
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const remote = snap.data().payload || {};
      const local = localData();
      if (JSON.stringify(remote) !== JSON.stringify(local)) {
        const useCloud = confirm('A saved ADAYN workspace already exists in your account. Press OK to load that cloud copy on this device. Press Cancel to keep this device copy and upload it instead. Export a backup first if unsure.');
        if (useCloud) { applyingRemote = true; setLocal(remote); window.dispatchEvent(new CustomEvent('lifeos:reload')); applyingRemote = false; }
        else await setDoc(ref, {payload:local, updatedAt:serverTimestamp()});
      }
    } else {
      await setDoc(ref, {payload:localData(), updatedAt:serverTimestamp()});
    }
    unsubscribe = onSnapshot(ref, s => {
      if (!s.exists() || applyingRemote) return;
      const remote = s.data().payload;
      if (remote && JSON.stringify(remote) !== JSON.stringify(localData())) {
        applyingRemote = true; setLocal(remote); window.dispatchEvent(new CustomEvent('lifeos:reload')); applyingRemote = false;
      }
    }, err => state('Sync paused · local safe', u.email + ' · ' + friendly(err)));
    setAppVisible(true, u.email);
    state('Cloud sync · connected', u.email + ' · private workspace');
    status('You are signed in.');
  } catch (e) {
    activeUid = null;
    setAppVisible(true, u.email);
    state('Sync paused · local safe', u.email + ' · ' + friendly(e));
  }
}
let modulesSignIn, modulesCreate, modulesVerify, modulesReset, modulesSignOut, firestoreModules;
async function handleVerified(u) { if (!u || !u.emailVerified) return showVerification(u && u.email); await connectCloud(u, firestoreModules); }

$('showSignIn').onclick = () => mode('signin');
$('showSignUp').onclick = () => mode('signup');
$('backToLoginBtn').onclick = async () => { if (auth && auth.currentUser) { try { await modulesSignOut(auth); } catch {} } $('authEmail').value=''; $('authPassword').value=''; mode('signin'); };
$('closeAuth').onclick = () => $('authModal').classList.add('hidden');
$('signInBtn').onclick = async () => {
  if (busy) return;
  const email=$('authEmail').value.trim(), password=$('authPassword').value;
  if (!email || !password) return status('Enter your email address and password first.');
  setBusy(true,'signInBtn');
  try {
    const result=await modulesSignIn(auth,email,password); await result.user.reload();
    if (!result.user.emailVerified) {
      try { await modulesVerify(result.user); status('Your email is still unverified. We sent another verification link.'); }
      catch(e) { status('Your email is not verified yet. ' + friendly(e)); }
      showVerification(email);
    } else await handleVerified(result.user);
  } catch(e) { status(friendly(e)); }
  finally { setBusy(false,'signInBtn'); }
};
$('signUpBtn').onclick = async () => {
  if (busy) return;
  const email=$('authEmail').value.trim(), password=$('authPassword').value;
  if (!email || !password) return status('Enter your email address and choose a password first.');
  if (password.length < 6) return status('Choose a password with at least 6 characters.');
  setBusy(true,'signUpBtn');
  try {
    const result=await modulesCreate(auth,email,password);
    try { await modulesVerify(result.user); showVerification(email); status('Account created. Verification email sent. Check Inbox, Spam and Promotions.'); }
    catch(e) { showVerification(email); status('Your account was created, but Firebase could not send the verification email: ' + friendly(e)); }
  } catch(e) { status(friendly(e)); }
  finally { setBusy(false,'signUpBtn'); }
};
$('resetPasswordBtn').onclick = async () => {
  if (busy) return;
  const email=$('authEmail').value.trim();
  if(!email) return status('Enter your email address first, then choose Forgot password.');
  setBusy(true,'resetPasswordBtn');
  try { await modulesReset(auth,email); status('Password reset email sent. Check your inbox and Spam folder.'); }
  catch(e) { status(friendly(e)); }
  finally { setBusy(false,'resetPasswordBtn'); }
};
$('resendVerificationBtn').onclick = async () => {
  if (busy) return;
  const u=auth && auth.currentUser;
  if(!u) return status('Please sign in again to resend the verification email.');
  setBusy(true,'resendVerificationBtn');
  try { await modulesVerify(u); status('Another verification email has been sent. Check Inbox, Spam and Promotions.'); }
  catch(e) { status(friendly(e)); }
  finally { setBusy(false,'resendVerificationBtn'); }
};
$('checkVerificationBtn').onclick = async () => {
  if (busy) return;
  const u=auth && auth.currentUser;
  if(!u) return status('Your session expired. Please sign in again.');
  setBusy(true,'checkVerificationBtn');
  try { await u.reload(); if(!auth.currentUser.emailVerified) status('It is not verified yet. Open the email link first, then try again.'); else await handleVerified(auth.currentUser); }
  catch(e) { status(friendly(e)); }
  finally { setBusy(false,'checkVerificationBtn'); }
};
$('signOutBtn').onclick = async () => {
  try { if(unsubscribe) unsubscribe(); unsubscribe=null; activeUid=null; activeUser=null; await modulesSignOut(auth); setAppVisible(false); mode('signin'); state('Signed out','Your local data remains saved on this device.'); }
  catch(e) { status(friendly(e)); }
};

if (!configured) {
  $('authTabs').classList.add('hidden'); $('authForm').classList.add('hidden'); $('firebaseSetupHint').classList.remove('hidden');
  status('Firebase is not connected. The site owner must configure the Firebase Web App settings before registration can work.');
} else {
  try {
    const [appMod,authMod,fsMod] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
    ]);
    const app=appMod.initializeApp(firebaseConfig); auth=authMod.getAuth(app); cloudDb=fsMod.getFirestore(app);
    modulesSignIn=authMod.signInWithEmailAndPassword; modulesCreate=authMod.createUserWithEmailAndPassword; modulesVerify=authMod.sendEmailVerification; modulesReset=authMod.sendPasswordResetEmail; modulesSignOut=authMod.signOut;
    firestoreModules=fsMod; auth.languageCode='en'; mode('signin');
    authMod.onAuthStateChanged(auth, async u => {
      if (unsubscribe) { unsubscribe(); unsubscribe=null; }
      activeUid=null; activeUser=u;
      if (!u) { setAppVisible(false); mode('signin'); state('Not signed in','Sign in to access your private workspace.'); return; }
      try { await u.reload(); } catch(e) { status(friendly(e)); }
      if (!auth.currentUser || !auth.currentUser.emailVerified) { setAppVisible(false); showVerification(u.email); return; }
      await handleVerified(auth.currentUser);
    });
    window.LIFEOS_SYNC={queue(data){
      if(!activeUser || !activeUser.emailVerified || applyingRemote) return;
      pending=JSON.parse(JSON.stringify(data)); clearTimeout(timer);
      timer=setTimeout(async()=>{
        if(!activeUser || !pending) return;
        try { await fsMod.setDoc(fsMod.doc(cloudDb,'users',activeUser.uid,'workspace','main'),{payload:pending,updatedAt:fsMod.serverTimestamp()}); state('Cloud sync · saved',activeUser.email+' · last sync just now'); }
        catch(e) { state('Offline · changes kept locally',friendly(e)); }
      },1000);
    }};
    window.addEventListener('online',()=>{ if(activeUser && pending) window.LIFEOS_SYNC.queue(pending); });
  } catch(e) {
    $('authTabs').classList.add('hidden'); $('authForm').classList.add('hidden'); $('firebaseSetupHint').classList.remove('hidden');
    status('Firebase could not start: ' + friendly(e) + ' Check the Firebase config and authorised domain, then reload.');
  }
}
