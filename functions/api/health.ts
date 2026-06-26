import firebaseConfig from "../../firebase-applet-config.json";

export async function onRequestGet(context: any) {
  const env = context.env || {};
  console.log("Health check. Env PROJECT ID:", env.GOOGLE_CLOUD_PROJECT || env.GCP_PROJECT || "not set");
  console.log("Firebase Config Project ID:", firebaseConfig?.projectId);
  
  const envKeys = Object.keys(env).filter(key => key.startsWith('GOOGLE') || key.startsWith('FIREBASE') || key.includes('PROJECT'));

  return new Response(
    JSON.stringify({
      status: "ok",
      envProject: env.GOOGLE_CLOUD_PROJECT || env.GCP_PROJECT || "not set",
      configProject: firebaseConfig?.projectId,
      envKeys: envKeys
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
