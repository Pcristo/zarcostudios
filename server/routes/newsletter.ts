import { Router } from "express";
import { doc, getDoc, getDocs, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { clientDb } from "../services/firebase";
import { resend } from "../services/resend";

const router = Router();

// Newsletter Subscription Route
router.post("/subscribe", async (req, res) => {
  const { email, lang } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const collectionName = lang === "pt" ? "pt_subscribers" : "subscribers";
  
  if (!clientDb) {
    return res.status(500).json({ error: "Database not available", detail: "Client Firestore failed to initialize" });
  }

  try {
    console.log(`Attempting subscription for ${email} in collection ${collectionName} via Client SDK`);
    const subDocRef = doc(clientDb, collectionName, email);
    const docSnap = await getDoc(subDocRef);
    
    if (docSnap.exists()) {
      return res.status(409).json({ error: "Already subscribed", message: lang === 'pt' ? 'Este e-mail já está inscrito.' : 'This email is already subscribed.' });
    }

    await setDoc(subDocRef, {
      email,
      lang,
      active: true,
      subscribedAt: serverTimestamp(),
    });
    console.log(`Successfully subscribed ${email} to ${collectionName}`);

    // Send Email via Resend
    const isPt = lang === "pt";
    const subject = isPt ? "Obrigado por se inscrever!" : "Thanks for subscribing!";
    const greeting = isPt ? "Olá," : "Hello,";
    const message = isPt 
      ? "Obrigado por se inscrever na newsletter da Zarco Studios. Fique atento às nossas novidades e projetos!" 
      : "Thank you for subscribing to the Zarco Studios newsletter. Stay tuned for updates, projects, and insights.";
    const copyRights = isPt
       ? "Todos os direitos reservados"  
       : "All rights reserved.";
    
    const unsubscribeText = isPt ? "Remover subscrição" : "Unsubscribe";
    const unsubscribeUrl = `${req.protocol}://${req.get('host')}/unsubscribe?email=${encodeURIComponent(email)}&lang=${lang}`;
    
    // Get logo from settings if possible, or use a placeholder
    let logoUrl = null;
    try {
      const settingsDoc = await getDoc(doc(clientDb, "settings", "company-legal"));
      if (settingsDoc.exists()) {
        logoUrl = settingsDoc.data()?.logoUrl;
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
          ${isPt ? 'Não responda a este e-mail. Para qualquer dúvida, envie um e-mail para info@zarcostudios.com ou visite <a href="https://zarcostudios.com" style="color: #999; text-decoration: underline;">zarcostudios.com</a>.' : 'No reply to this email. For any inquiries, please email info@zarcostudios.com or visit <a href="https://zarcostudios.com" style="color: #999; text-decoration: underline;">zarcostudios.com</a>.'}
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
      const emailResponse = await resend.emails.send({
        from: 'Zarco Studios <hello@zarcostudios.com>',
        to: [email],
        subject: subject,
        html: htmlContent,
      });

      if (emailResponse.error) {
        emailStatus = "failed";
        emailErrorDetails = emailResponse.error;
        console.error("Resend API rejected the email request with error:", JSON.stringify(emailResponse.error, null, 2));
      } else {
        emailStatus = "sent";
        console.log("Resend API sent confirmation email successfully:", emailResponse.data);
      }
    } catch (emailError: any) {
      emailStatus = "error";
      emailErrorDetails = { message: emailError.message, name: emailError.name };
      console.error("Email sending execution failed but subscription database record succeeded:", emailError);
    }

    res.status(200).json({ 
      success: true, 
      message: isPt ? 'Subscrição concluída com sucesso!' : 'Subscription successful!',
      emailStatus,
      emailError: emailErrorDetails
    });
  } catch (error: any) {
    console.error("Subscription error detail:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      detail: error.message,
      code: error.code
    });
  }
});

// Toggle Subscriber Status (Deprecated backend logic)
router.post("/admin/subscribers/toggle-status", async (req, res) => {
  res.status(410).json({ error: "Deprecated. Use Client SDK directly." });
});

// Newsletter Send Route (Admin Only)
router.post("/admin/send-newsletter", async (req, res) => {
  const { subject, content, lang } = req.body;

  if (!subject || !content) {
    return res.status(400).json({ error: "Missing subject or content" });
  }

  if (!clientDb) return res.status(500).json({ error: "Database not initialized" });

  try {
    // 1. Determine target emails
    let recipients: { email: string; lang: string }[] = [];
    
    if (req.body.emails && Array.isArray(req.body.emails) && req.body.emails.length > 0) {
      recipients = req.body.emails.map(e => ({ email: e, lang: lang === "all" ? "en" : lang }));
    } else if (lang === "all") {
      const [enSnap, ptSnap] = await Promise.all([
        getDocs(collection(clientDb, "subscribers")),
        getDocs(collection(clientDb, "pt_subscribers"))
      ]);
      recipients = [
        ...enSnap.docs.filter(d => d.data().active !== false).map(d => ({ email: d.data().email, lang: "en" })),
        ...ptSnap.docs.filter(d => d.data().active !== false).map(d => ({ email: d.data().email, lang: "pt" }))
      ];
    } else {
      const collectionName = lang === "pt" ? "pt_subscribers" : "subscribers";
      const snapshot = await getDocs(collection(clientDb, collectionName));
      recipients = snapshot.docs.filter(d => d.data().active !== false).map(d => ({ email: d.data().email, lang: lang }));
    }

    if (recipients.length === 0) {
      return res.status(200).json({ success: true, message: "No active subscribers to send to." });
    }

    // 2. Get company logo for branding
    let logoUrl = null;
    try {
      const settingsSnap = await getDoc(doc(clientDb, "settings", "company-legal"));
      logoUrl = settingsSnap.exists() ? settingsSnap.data()?.logoUrl : null;
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
      const unsubscribeUrl = `${req.protocol}://${req.get('host')}/unsubscribe?email=${encodeURIComponent(emailSub)}&lang=${emailLang}`;

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

    // 4. Send emails
    let sentCount = 0;
    let failCount = 0;
    const errorsList: any[] = [];

    for (const recipient of recipients) {
      try {
        const emailResponse = await resend.emails.send({
          from: 'Zarco Studios Newsletter <hello@zarcostudios.com>',
          to: [recipient.email],
          subject: subject,
          html: getHtmlTemplate(recipient.email, recipient.lang),
        });

        if (emailResponse.error) {
          console.error(`Failed to send newsletter to ${recipient.email} (Resend API Error):`, JSON.stringify(emailResponse.error, null, 2));
          errorsList.push({ email: recipient.email, error: emailResponse.error });
          failCount++;
        } else {
          console.log(`Successfully sent newsletter to ${recipient.email}:`, emailResponse.data);
          sentCount++;
        }
      } catch (err: any) {
        console.error(`Failed to send newsletter to ${recipient.email} (Execution Error):`, err);
        errorsList.push({ email: recipient.email, error: { message: err.message, name: err.name } });
        failCount++;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Newsletter processed. Sent: ${sentCount}, Failed: ${failCount}`,
      sentCount,
      failCount,
      errors: errorsList.length > 0 ? errorsList : undefined
    });
  } catch (error: any) {
    console.error("Newsletter send error:", error);
    res.status(500).json({ error: "Failed to process newsletter", detail: error.message });
  }
});

// Unsubscribe Route
router.get("/unsubscribe", async (req, res) => {
  const { email, lang } = req.query;

  if (!email || typeof email !== "string") {
    return res.status(400).send("Invalid request: Email missing.");
  }

  const collectionName = lang === "pt" ? "pt_subscribers" : "subscribers";

  if (!clientDb) {
    return res.status(500).send("Database error. Please try again later.");
  }

  try {
    const subRef = doc(clientDb, collectionName, email);
    const docSnap = await getDoc(subRef);

    if (docSnap.exists()) {
      await setDoc(subRef, { active: false }, { merge: true });
    } else if (lang !== "all") {
      // Try the other collection just in case
      const altCollection = lang === "pt" ? "subscribers" : "pt_subscribers";
      const altRef = doc(clientDb, altCollection, email);
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

    res.send(`
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
    `);
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).send("An error occurred during unsubscription. Please contact support@zarcostudios.com");
  }
});

export default router;
