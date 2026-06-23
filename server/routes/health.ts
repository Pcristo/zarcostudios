import { Router } from "express";
import { firebaseConfig } from "../services/firebase";

const router = Router();

router.get("/", (req, res) => {
  console.log("Health check. Env PROJECT ID:", process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || "not set");
  console.log("Firebase Config Project ID:", firebaseConfig?.projectId);
  console.log("Environment Keys:", Object.keys(process.env).filter(key => key.startsWith('GOOGLE') || key.startsWith('FIREBASE') || key.includes('PROJECT')));
  res.json({ 
    status: "ok", 
    envProject: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || "not set",
    configProject: firebaseConfig?.projectId,
    envKeys: Object.keys(process.env).filter(key => key.startsWith('GOOGLE') || key.startsWith('FIREBASE') || key.includes('PROJECT'))
  });
});

export default router;
