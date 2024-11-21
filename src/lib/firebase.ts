import { initializeApp } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA9RKIbq7ZfYB2TKEfy8OoTeY6095PwP4g",
  authDomain: "capstone-inventory-system.firebaseapp.com",
  projectId: "capstone-inventory-system",
  storageBucket: "capstone-inventory-system.appspot.com",
  messagingSenderId: "199250058474",
  appId: "1:199250058474:web:e6a82d91cd598ccc468b93",
  measurementId: "G-RKPHP547NS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence.');
  }
});

export const analytics = getAnalytics(app);