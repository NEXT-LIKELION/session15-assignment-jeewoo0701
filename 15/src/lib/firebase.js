// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApmwYsFvvgnrW-LdTfVl6zQ7vz0q78nzM",
  authDomain: "homework15-4b8e9.firebaseapp.com",
  projectId: "homework15-4b8e9",
  storageBucket: "homework15-4b8e9.firebasestorage.app",
  messagingSenderId: "521489974052",
  appId: "1:521489974052:web:e66169d95d68b49e30a9b1",
  measurementId: "G-FZGPCDL55F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);