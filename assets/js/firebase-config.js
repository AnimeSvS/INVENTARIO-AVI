// assets/js/firebase-config.js

const firebaseConfig = {
    apiKey: "AIzaSyC89hbHrHZW6-wqzEb4b0JfPbuqK5xjTqA",
    authDomain: "navidad-98236.firebaseapp.com",
    projectId: "navidad-98236",
    storageBucket: "navidad-98236.firebasestorage.app",
    messagingSenderId: "970059975348",
    appId: "1:970059975348:web:ec7c69012c7db1b8f965e1",
    measurementId: "G-XEL1N7WWBC"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

window.db = db;