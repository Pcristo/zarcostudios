import { getDocument, listDocuments } from "../../_lib/firestore-rest";
import { sendEmailViaFetch } from "../../_lib/resend-rest";

export async function onRequestPost(context: any) {
  const env = context.env || {};
  try {
    const body = await context.request.json();
    const { subject, content, lang, emails } = body;

    if (!subject || !content) {
      return new Response(
        JSON.stringify({ error: "Missing subject or content" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Determine target emails using REST API helpers
    let recipients: { email: string; lang: string }[] = [];
    
    if (emails && Array.isArray(emails) && emails.length > 0) {
      recipients = emails.map((e: string) => ({ email: e, lang: lang === "all" ? "en" : lang }));
    } else if (lang === "all") {
      const [enSubs, ptSubs] = await Promise.all([
        listDocuments("subscribers"),
        listDocuments("pt_subscribers")
      ]);
      recipients = [
        ...enSubs.filter((d: any) => d.active !== false).map((d: any) => ({ email: d.email, lang: "en" })),
        ...ptSubs.filter((d: any) => d.active !== false).map((d: any) => ({ email: d.email, lang: "pt" }))
      ];
    } else {
      const collectionName = lang === "pt" ? "pt_subscribers" : "subscribers";
      const subs = await listDocuments(collectionName);
      recipients = subs.filter((d: any) => d.active !== false).map((d: any) => ({ email: d.email, lang: lang }));
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No active subscribers to send to." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Get company logo for branding
    let logoUrl = null;
    try {
      const settingsDoc = await getDocument("settings", "company-legal");
      logoUrl = settingsDoc ? settingsDoc.logoUrl : null;
    } catch (e) {
      console.warn("Failed to fetch settings for logo in newsletter:", e);
    }

    // 3. Prepare HTML template helper
    const getHtmlTemplate = (emailSub: string, emailLang: string) => {
      const isPt = emailLang === "pt";
      const footerText = isPt 
        ? "Recebeu este e-mail porque se inscreveu nas atualizações do Zarco Studios."
        : "You are receiving this because you subscribed to Zarco Studios updates.";
      const copyright = isPt 
        ? "© 2026 Zarco Studios. Todos os direitos reservados."
        : "© 2026 Zarco Studios. All rights reserved.";
      const unsubscribeText = isPt ? "Remover subscrição" : "Unsubscribe";
      
      const requestUrl = new URL(context.request.url);
      const unsubscribeUrl = `${requestUrl.protocol}//${requestUrl.host}/unsubscribe?email=${encodeURIComponent(emailSub)}&lang=${emailLang}`;

      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
          ${logoUrl ? `<div style="text-align: left; margin-bottom: 30px;"><img src="${logoUrl}" alt="Logo" style="max-height: 146px;"></div>` : '<div style="text-align: left; margin-bottom: 30px; font-size: 20px; font-weight: bold; text-transform: uppercase;">ZARCO STUDIOS</div>'}
          <div style="background-color: #f9f9f9; padding: 40px; border-radius: 10px; border: 1px solid #eee;">
            <h1 style="color: #111; margin-top: 0; font-size: 24px; text-transform: uppercase;">${subject}</h1>
            <div style="margin-top: 20px; font-size: 16px; color: #444;">
              ${content}
            </div>
          </div>
          <div style="font-size: 11px; color: #999; text-align: center; margin-top: 40px;">
            <p>${footerText}</p>
            <p style="margin: 15px 0;">
              ${isPt ? 'Não responda a este e-mail. Para qualquer dúvida, envie um e-mail para info@zarcostudios.com ou visite <a href="https://zarcostudios.com" style="color: #999; text-decoration: underline;">zarcostudios.com</a>.' : 'No reply to this email. For any inquiries, please email info@zarcostudios.com or visit <a href="https://zarcostudios.com" style="color: #999; text-decoration: underline;">zarcostudios.com</a>.'}
            </p>
            <p>${copyright}</p>
            <p style="margin-top: 20px;">
              <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">${unsubscribeText}</a>
            </p>
          </div>
        </div>
      `;
    };

    // 4. Send emails using direct fetch
    let sentCount = 0;
    let failCount = 0;
    const errorsList: any[] = [];

    for (const recipient of recipients) {
      try {
        await sendEmailViaFetch(env, {
          from: 'Zarco Studios Newsletter <hello@zarcostudios.com>',
          to: [recipient.email],
          subject: subject,
          html: getHtmlTemplate(recipient.email, recipient.lang),
        });
        sentCount++;
      } catch (err: any) {
        console.error(`Failed to send newsletter to ${recipient.email}:`, err);
        errorsList.push({ email: recipient.email, error: { message: err.message } });
        failCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Newsletter processed. Sent: ${sentCount}, Failed: ${failCount}`,
        sentCount,
        failCount,
        errors: errorsList.length > 0 ? errorsList : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Newsletter send error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process newsletter", detail: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
