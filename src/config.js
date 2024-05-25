// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3pzXCeS5ymypUvNVGJlyIsw2ZmnlW0Mw",
  authDomain: "next-firebase-ebeac.firebaseapp.com",
  projectId: "next-firebase-ebeac",
  storageBucket: "next-firebase-ebeac.appspot.com",
  messagingSenderId: "154849598828",
  appId: "1:154849598828:web:eff505d2cc52556749a749",
  measurementId: "G-EZG352NSHJ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore()
export const storage = getStorage();

// Create a storage reference from our storage service
