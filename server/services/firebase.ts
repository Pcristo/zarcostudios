import fs from "fs";
import path from "path";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp as initClientApp } from "firebase/app";
import { getFirestore as getClientFirestore } from "firebase/firestore";

// Read Firebase Config safely
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
export let firebaseConfig: any = null;

if (fs.existsSync(firebaseConfigPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    if (firebaseConfig.projectId) {
      process.env.GOOGLE_CLOUD_PROJECT = firebaseConfig.projectId;
      console.log(`Setting GOOGLE_CLOUD_PROJECT to ${firebaseConfig.projectId}`);
    }
  } catch (e) {
    console.error("Error parsing firebase-applet-config.json:", e);
  }
}

// Initialize Client SDK (works everywhere with API Key)
export const clientApp = firebaseConfig ? initClientApp(firebaseConfig) : null;
export const clientDb = clientApp ? getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId) : null;

let adminDbInstance: any = null;

// Initialize Firebase Admin SDK (used for admin-only operations)
export function initFirebase() {
  if (adminDbInstance) return adminDbInstance;
  
  try {
    if (!firebaseConfig) {
      console.error("Cannot initialize Firebase: config missing");
      return null;
    }

    let app;
    const apps = getApps();
    if (apps.length === 0) {
      // Force project ID from config to avoid environment default project issues
      app = initializeApp({
        projectId: firebaseConfig.projectId
      });
      console.log(`Firebase Admin initialized with Project ID: ${firebaseConfig.projectId}`);
    } else {
      app = apps[0];
    }
    
    // Explicitly use the databaseId from config
    const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
    adminDbInstance = getFirestore(app, dbId);
    
    return adminDbInstance;
  } catch (err) {
    console.error("Firebase Admin initialization failed:", err);
    return null;
  }
}

// Perform initial admin initialization
initFirebase();

export { adminDbInstance as db };
