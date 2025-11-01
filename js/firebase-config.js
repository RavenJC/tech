// Firebase Configuration
// IMPORTANT: Replace these values with your own Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration

  const firebaseConfig = {
    apiKey: "AIzaSyBWo4oi1DRTJkZLsbtUUOyobL7he8HVyjo",
    authDomain: "ecommerce2-b62f9.firebaseapp.com",
    projectId: "ecommerce2-b62f9",
    storageBucket: "ecommerce2-b62f9.firebasestorage.app",
    messagingSenderId: "643529068349",
    appId: "1:643529068349:web:39ff52aa49c4bea7ee7f54",
    measurementId: "G-4XM6FGRVXV"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

console.log('Firebase initialized successfully');