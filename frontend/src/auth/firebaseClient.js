import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";

let firebaseAuth = null;
let googleProvider = null;

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
}

export function getFirebaseAuthClient() {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const config = getFirebaseConfig();
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    throw new Error("Firebase auth is enabled, but the Firebase env vars are incomplete.");
  }

  const app = initializeApp(config);
  firebaseAuth = getAuth(app);
  return firebaseAuth;
}

function getGoogleProvider() {
  if (googleProvider) {
    return googleProvider;
  }

  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: "select_account"
  });
  return googleProvider;
}

export async function firebaseRegister({ name, email, password }) {
  const auth = getFirebaseAuthClient();
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }

  const token = await credential.user.getIdToken();
  return {
    token,
    user: credential.user
  };
}

export async function firebaseLogin({ email, password }) {
  const auth = getFirebaseAuthClient();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const token = await credential.user.getIdToken();

  return {
    token,
    user: credential.user
  };
}

export async function firebaseLoginWithGoogle() {
  const auth = getFirebaseAuthClient();
  const credential = await signInWithPopup(auth, getGoogleProvider());
  const token = await credential.user.getIdToken();

  return {
    token,
    user: credential.user
  };
}

export async function firebaseLogout() {
  const auth = getFirebaseAuthClient();
  await signOut(auth);
}
