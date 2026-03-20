// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLA_Jh57HrazKWUoaBTh_KT5muIa3i960",
  authDomain: "notes-app-81ab7.firebaseapp.com",
  projectId: "notes-app-81ab7",
  storageBucket: "notes-app-81ab7.firebasestorage.app",
  messagingSenderId: "236174270956",
  appId: "1:236174270956:web:896ba1cc2571aad595a0c9",
  measurementId: "G-GVSTHXJDRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;