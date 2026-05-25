import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCiUMpw62nHzp5PnUv1orcwdhnwpJ16FsA",
  authDomain: "skill-tracker-vault.firebaseapp.com",
  projectId: "skill-tracker-vault",
  storageBucket: "skill-tracker-vault.firebasestorage.app",
  messagingSenderId: "659611278369",
  appId: "1:659611278369:web:b1967896e37574b1499760"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
