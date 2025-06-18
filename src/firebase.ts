// 必要な機能をFirebaseからインポートします
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// .env.localファイルから秘密の鍵を読み込みます
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// Firebaseを初期化します
const app = initializeApp(firebaseConfig);

// Firestoreデータベースを使えるようにします
export const db = getFirestore(app);

// Firebase認証を使えるようにします
export const auth = getAuth(app);