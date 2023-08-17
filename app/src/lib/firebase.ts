import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// This configuration is safe to expose to client.
const firebaseConfig = {
  apiKey: "AIzaSyBXRvjK9polr0G6wWH-nTZv3KgEybe4qV8",
  authDomain: "solana-auth-36fe5.firebaseapp.com",
  projectId: "solana-auth-36fe5",
  appId: "1:141741186150:web:89c926423ebfc92ac321a7",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
