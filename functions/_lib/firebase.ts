import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

export function getFirebaseDb() {
  const app = initializeApp(firebaseConfig);
  return getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
