// ...existing code...
'use client';

import { initializeApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

let app: FirebaseApp | null = null;

export function initFirebase(config: FirebaseOptions) {
  if (!app) app = initializeApp(config);
  return app;
}

export function auth() {
  if (!app) throw new Error('Firebase not initialized. Call initFirebase(config) first.');
  return getAuth(app);
}

export async function signInWithGooglePopup() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth(), provider);
}

export function signOut() {
  return firebaseSignOut(auth());
}

export function onAuthChanged(cb: (u: User | null) => void) {
  return onAuthStateChanged(auth(), cb);
}
// ...existing code...