import { firebaseConfig } from './firebase-config.js';

const configured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('PASTE_') && firebaseConfig.projectId && firebaseConfig.projectId !== 'YOUR_PROJECT_ID';
const $ = id => document.getElementById(id);
const status = (message, detail='') => { $('authStatus').textContent=message; if(detail) $('accountDetails').textContent=detail; };
let auth, db, user, unsubscribe=null, pending=null, timer=null, applyingRemote=false;
const LOCAL_KEY='lifeos_custom_v2';
const localData=()=>{try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}')}catch{return {}}};
const setLocal=data=>localStorage.setItem(LOCAL_KEY,JSON.stringify(data));
const state=(label,detail)=>{$('syncState').textContent=label;$('accountDetails').textContent=detail;};

if (!configured) {
  state('Local-first · Firebase setup pending','Add your Firebase web config to firebase-config.js, then reload to enable account sync.');
  status('Firebase is not configured yet. Local storage, backup and calendar export work now.');
} else {
  try {
    const [{initializeApp},{getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,signOut,onAuthStateChanged,sendEmailVerification},{getFirestore,doc,getDoc,setDoc,onSnapshot,serverTimestamp}]=await Promise.all([import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')]);
    const app=initializeApp(firebaseConfig); auth=getAuth(app); db=getFirestore(app);
    $('authStatus').textContent='Ready. Create an account or sign in to enable private cloud sync.';
    $('signInBtn').onclick=async()=>{try{await signInWithEmailAndPassword(auth,$('authEmail').value.trim(),$('authPassword').value);status('Signed in. Sync is starting…')}catch(e){status(friendly(e))}};
    $('signUpBtn').onclick=async()=>{try{const c=await createUserWithEmailAndPassword(auth,$('authEmail').value.trim(),$('authPassword').value);await sendEmailVerification(c.user);status('Account created. Check your inbox to verify your email.')}catch(e){status(friendly(e))}};
    $('resetPasswordBtn').onclick=async()=>{try{if(!$('authEmail').value.trim())throw new Error('Enter your email address first.');await sendPasswordResetEmail(auth,$('authEmail').value.trim());status('Password reset email sent.')}catch(e){status(friendly(e))}};
    $('signOutBtn').onclick=async()=>{try{if(unsubscribe)unsubscribe();unsubscribe=null;await signOut(auth);state('Device-only · signed out','Your local copy remains on this device.')}catch(e){status(friendly(e))}};
    onAuthStateChanged(auth,async u=>{
      user=u;
      if(unsubscribe){unsubscribe();unsubscribe=null;}
      if(!u){state('Device-only · not signed in','Your local copy remains available. Sign in to sync across devices.');return;}
      state('Connecting cloud sync…',u.email||'Signed in');
      const ref=doc(db,'users',u.uid,'workspace','main');
      try {
        const snap=await getDoc(ref);
        if(snap.exists()){
          const remote=snap.data().payload||{};
          const useCloud=confirm('A LIFE OS cloud backup already exists for this account. Choose OK to load the cloud copy on this device. Choose Cancel to keep this device’s data and upload it to the cloud. Export a backup first if unsure.');
          if(useCloud){applyingRemote=true;setLocal(remote);applyingRemote=false;window.dispatchEvent(new CustomEvent('lifeos:reload'))}
          else await setDoc(ref,{payload:localData(),updatedAt:serverTimestamp()});
        } else {
          await setDoc(ref,{payload:localData(),updatedAt:serverTimestamp()});
        }
        unsubscribe=onSnapshot(ref,s=>{if(!s.exists()||applyingRemote)return;const data=s.data().payload;if(data){const local=localData();if(JSON.stringify(data)!==JSON.stringify(local)){applyingRemote=true;setLocal(data);window.dispatchEvent(new CustomEvent('lifeos:reload'));applyingRemote=false;}}});
        state('Cloud sync · connected',u.email+' · private workspace');
      } catch(e){state('Sync paused · local safe',u.email+' · '+friendly(e));}
    });
    window.LIFEOS_SYNC={queue(data){if(!user||applyingRemote)return;pending=JSON.parse(JSON.stringify(data));clearTimeout(timer);timer=setTimeout(async()=>{if(!user||!pending)return;try{await setDoc(doc(db,'users',user.uid,'workspace','main'),{payload:pending,updatedAt:serverTimestamp()});state('Cloud sync · saved',user.email+' · last sync just now')}catch(e){state('Offline · changes kept locally',friendly(e));}},1200)}};
  } catch(e){state('Local-first · Firebase unavailable',friendly(e));}
}
function friendly(e){const m=e?.message||String(e);if(m.includes('auth/invalid-credential'))return 'Email or password is incorrect.';if(m.includes('auth/email-already-in-use'))return 'This email already has an account. Sign in instead.';if(m.includes('auth/weak-password'))return 'Use a password with at least 6 characters.';if(m.includes('auth/invalid-email'))return 'Enter a valid email address.';if(m.includes('permission-den denied')||m.includes('permission-denied'))return 'Cloud access was blocked. Check your Firestore security rules.';return m;}
window.addEventListener('online',()=>{if(user&&pending)window.LIFEOS_SYNC?.queue(pending)});
