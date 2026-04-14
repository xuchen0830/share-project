// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-JUfgsv_lKEMbbWCJmEG_boGkYqy1y6c",
  authDomain: "asher-stock-ai.firebaseapp.com",
  projectId: "asher-stock-ai",
  storageBucket: "asher-stock-ai.firebasestorage.app",
  messagingSenderId: "580279389458",
  appId: "1:580279389458:web:e1955721c159e7c73fb7cb",
  measurementId: "G-6RD1DB480X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// 💡 關鍵：必須使用 export 把這些工具「導出去」，React 才借得到
export const auth = getAuth(app); 
export const googleProvider = new GoogleAuthProvider();

// 💡 為了讓你在 StockDashboard.jsx 寫起來更輕鬆，我幫你封裝好這兩個函式
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);