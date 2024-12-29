// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRumacWKbrEYhMlqDC5cp6AwlHRLGeop4",
  authDomain: "lgdv-calendrier.firebaseapp.com",
  projectId: "lgdv-calendrier",
  storageBucket: "lgdv-calendrier.firebasestorage.app",
  messagingSenderId: "1028153860530",
  appId: "1:1028153860530:web:1e92887bb2f3e7657844ab",
  measurementId: "G-FB8QPMNZVK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;