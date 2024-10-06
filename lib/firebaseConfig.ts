import { getApp, getApps, initializeApp } from "firebase/app";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDE678zMPAW9QZp3ueUl4EbhEZXvh_5S2s",
  authDomain: "video-upload-8a7ee.firebaseapp.com",
  projectId: "video-upload-8a7ee",
  storageBucket: "video-upload-8a7ee.appspot.com",
  messagingSenderId: "899898158208",
  appId: "1:899898158208:web:ef72781b2979bb52a38a65",
};

const app = initializeApp(firebaseConfig);

const initFirebaseAuth = () => {
  let app = null;

  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);

      initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
    } catch (error) {
      console.error("firebaseConfig.ts: " + error);
    }
  } else {
    app = getApp();

    initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  }
};

initFirebaseAuth();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
