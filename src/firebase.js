import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB5114BXV4hSgJuqI8GkJJcUMB-cUFgwvg",
    authDomain: "crypto-tracker-57e65.firebaseapp.com",
    projectId: "crypto-tracker-57e65",
    storageBucket: "crypto-tracker-57e65.appspot.com",
    messagingSenderId: "1059423391256",
    appId: "1:1059423391256:web:044a86afd5ece11ef07d6d",
    measurementId: "G-JNEJBDYW2C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
