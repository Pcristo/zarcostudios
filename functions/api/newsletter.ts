import { getDocument, setDocument } from "../_lib/firestore-rest";
import { sendEmailViaFetch } from "../_lib/resend-rest";

// Handle direct access to /api/newsletter
export async function onRequestPost(context: any) {
  const env = context.env || {};
  try {
    const body = await context.request.json();
    const { email, lang } = body;

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const collectionName = lang === "pt" ? "pt_subscribers" : "subscribers";

    const existingSub = await getDocument(collectionName, email);

    if (existingSub) {
      return new Response(
        JSON.stringify({ 
          error: "Already subscribed", 
          message: lang === 'pt' ? 'Este e-mail já está inscrito.' : 'This email is already subscribed.' 
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    await setDocument(collectionName, email, {
      email,
      lang,
      active: true,
      subscribedAt: new Date(), // Use raw Date object so helper maps to timestampValue and satisfies security rules
    });

    const isPt = lang === "pt";
    const subject = isPt ? "Obrigado por se inscrever!" : "Thanks for subscribing!";
    const greeting = isPt ? "Olá," : "Hello,";
    const message = isPt 
      ? "Obrigado por se inscrever na newsletter da Zarco Studios. Fique atento às nossas novidades e projetos!" 
      : "Thank you for subscribing to the Zarco Studios newsletter. Stay tuned for updates, projects, and insights.";
    
    const requestUrl = new URL(context.request.url);
    const unsubscribeUrl = `${requestUrl.protocol}//${requestUrl.host}/unsubscribe?email=${encodeURIComponent(email)}&lang=${lang}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h2 style="color: #22d3ee; text-transform: uppercase; letter-spacing: 1px;">${subject}</h2>
        <p>${greeting}</p>
        <p>${message}</p>
        <p><a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe / Cancelar</a></p>
      </div>
    `;

    await sendEmailViaFetch(env, {
      from: 'Zarco Studios <hello@zarcostudios.com>',
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Subscription successful!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function onRequestGet(context: any) {
  return new Response(
    JSON.stringify({ message: "Zarco Studios Newsletter API is active" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
