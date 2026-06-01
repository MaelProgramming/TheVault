import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_KEY,
  authDomain: "the-vault-2025.firebaseapp.com",
  projectId: "the-vault-2025",
  storageBucket: "the-vault-2025.firebasestorage.app",
  messagingSenderId: "700482305043",
  appId: "1:700482305043:web:919c4d437ff1ef5aa093e6",
  measurementId: "G-J95Z3JRZ3E"
};

// Initialisation avec garde pour éviter les doublons en Next.js hot reload
console.log("Firebase API Key reçue :", firebaseConfig.apiKey);
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

export default app;
