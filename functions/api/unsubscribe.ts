import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

export async function onRequestGet(context: any) {
  try {
    const requestUrl = new URL(context.request.url);
    const email = requestUrl.searchParams.get("email");
    const lang = requestUrl.searchParams.get("lang");

    if (!email) {
      return new Response("Invalid request: Email missing.", { status: 400 });
    }

    const collectionName = lang === "pt" ? "pt_subscribers" : "subscribers";

    // Initialize Firebase client DB
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

    const subRef = doc(db, collectionName, email);
    const docSnap = await getDoc(subRef);

    if (docSnap.exists()) {
      await setDoc(subRef, { active: false }, { merge: true });
    } else if (lang !== "all") {
      const altCollection = lang === "pt" ? "subscribers" : "pt_subscribers";
      const altRef = doc(db, altCollection, email);
      const altSnap = await getDoc(altRef);
      if (altSnap.exists()) {
        await setDoc(altRef, { active: false }, { merge: true });
      }
    }

    const isPt = lang === "pt";
    const title = isPt ? "Inscrição Removida" : "Unsubscribed";
    const message = isPt 
      ? "Lamentamos vê-lo partir. A sua subscrição foi removida com sucesso." 
      : "We're sorry to see you go. You have been successfully unsubscribed.";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #05080a; color: white; text-align: center; }
          .card { padding: 3rem; background: #0a1114; border-radius: 2rem; border: 1px solid rgba(255,255,255,0.05); max-width: 400px; }
          h1 { color: #22d3ee; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 2px; }
          p { color: rgba(255,255,255,0.6); line-height: 1.6; }
          .btn { margin-top: 2rem; display: inline-block; padding: 0.75rem 2rem; background: #22d3ee; color: black; text-decoration: none; font-weight: bold; border-radius: 0.75rem; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${title}</h1>
          <p>${message}</p>
          <a href="/" class="btn">Voltar ao Site / Back to Site</a>
        </div>
      </body>
      </html>
    `;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return new Response(
      "An error occurred during unsubscription. Please contact support@zarcostudios.com",
      { status: 500 }
    );
  }
}
