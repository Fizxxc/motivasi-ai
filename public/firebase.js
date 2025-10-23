// public/firebase.js
// Firebase CDN modular (v12.4.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, get, child } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// Ganti konfigurasi ini dengan milik kamu (dari Firebase Console)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCB9zVerEG3NV576aZlFo5J1LMsDipdtxA",
  authDomain: "chat-5c43d.firebaseapp.com",  
  databaseURL: "https://chat-5c43d-default-rtdb.firebaseio.com/",
  projectId: "chat-5c43d",
  storageBucket: "chat-5c43d.firebasestorage.app",
  messagingSenderId: "700137269779",
  appId: "1:700137269779:web:60a0374fb13083fadc6de6",
  measurementId: "G-8T9GVNH6LH"
};

// Inisialisasi Firebase App dan Database
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Fungsi helper global agar mudah dipakai di app.js
window.firebaseDB = {
  ref,
  push,
  set,
  onValue,
  get,
  child,
  db
};

console.log("✅ Firebase v12.4.0 initialized");
