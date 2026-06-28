import { getDocument, setDocument } from "../_lib/firestore-rest";
import { sendEmailViaFetch } from "../_lib/resend-rest";

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

    // Use Firestore REST API instead of client SDK
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

    // Send Email via Resend Fetch API
    const isPt = lang === "pt";
    const subject = isPt ? "Obrigado por se inscrever!" : "Thanks for subscribing!";
    const greeting = isPt ? "Olá," : "Hello,";
    const message = isPt 
      ? "Obrigado por se inscrever na newsletter da Zarco Studios. Fique atento às nossas novidades e projetos!" 
      : "Thank you for subscribing to the Zarco Studios newsletter. Stay tuned for updates, projects, and insights.";
    const copyRights = isPt ? "Todos os direitos reservados" : "All rights reserved.";
    
    const unsubscribeText = isPt ? "Remover subscrição" : "Unsubscribe";
    
    const requestUrl = new URL(context.request.url);
    const unsubscribeUrl = `${requestUrl.protocol}//${requestUrl.host}/unsubscribe?email=${encodeURIComponent(email)}&lang=${lang}`;
    
    let logoUrl = null;
    try {
      const settingsDoc = await getDocument("settings", "company-legal");
      if (settingsDoc) {
        logoUrl = settingsDoc.logoUrl;
      }
    } catch (settingsErr) {
      console.warn("Failed to fetch settings for logo:", settingsErr);
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        ${logoUrl ? `<div style="text-align: left; margin-bottom: 30px;"><img src="${logoUrl}" alt="Logo" style="max-height: 194px;"></div>` : '<div style="text-align: left; margin-bottom: 30px; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">ZARCO STUDIOS</div>'}
        <h2 style="color: #22d3ee; text-transform: uppercase; letter-spacing: 1px;">${subject}</h2>
        <p>${greeting}</p>
        <p>${message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 11px; color: #999; margin: 0 0 15px 0;">
          ${isPt ? 'Não responda a este e-mail. Para qualquer dúvida, envie um e-mail para info@zarcostudios.com or visite <a href="https://zarcostudios.com" style="color: #999; text-decoration: underline;">zarcostudios.com</a>.' : 'No reply to this email. For any inquiries, please email info@zarcostudios.com or visit <a href="https://zarcostudios.com" style="color: #999; text-decoration: underline;">zarcostudios.com</a>.'}
        </p>
        <p style="font-size: 12px; color: #888; margin-bottom: 10px;">&copy; ${new Date().getFullYear()} Zarco Studios. ${copyRights}</p>
        <p style="font-size: 11px; color: #999; margin: 0;">
          <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">${unsubscribeText}</a>
        </p>
      </div>
    `;

    let emailStatus = "unknown";
    let emailErrorDetails: any = null;

    try {
      await sendEmailViaFetch(env, {
        from: 'Zarco Studios <hello@zarcostudios.com>',
        to: [email],
        subject: subject,
        html: htmlContent,
      });
      emailStatus = "sent";
    } catch (emailError: any) {
      emailStatus = "error";
      emailErrorDetails = { message: emailError.message, name: emailError.name };
      console.error("Email sending execution failed but subscription database record succeeded:", emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: isPt ? 'Subscrição concluída com sucesso!' : 'Subscription successful!',
        emailStatus,
        emailError: emailErrorDetails
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Subscription error detail:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        detail: error.message,
        code: error.code
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
