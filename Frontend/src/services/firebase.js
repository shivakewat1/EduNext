import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMyTd_l8UnBzPKhG757QTfie3tk_62V-o",
  authDomain: "edunext-94790.firebaseapp.com",
  projectId: "edunext-94790",
  storageBucket: "edunext-94790.firebasestorage.app",
  messagingSenderId: "1098257674303",
  appId: "1:1098257674303:web:ba6518a1f5293ec7bb888a",
  measurementId: "G-YZYQCN6ND5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
