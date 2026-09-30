import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2gkmI3f-TPPuDRqxVmPnybs64zlO-o54",
  authDomain: "nmims-canteen-c4b40.firebaseapp.com",
  projectId: "nmims-canteen-c4b40",
  storageBucket: "nmims-canteen-c4b40.firebasestorage.app",
  messagingSenderId: "760798816372",
  appId: "1:760798816372:web:30c901a79a9bfe4e14c921",
  measurementId: "G-JXYS7P2XCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize analytics safely if supported in current environment
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  }).catch(() => {});
}

export { analytics };
export default app;

