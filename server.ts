import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Resend } from "resend";
import fs from "fs";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION at:", promise, "reason:", reason);
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { initializeApp as initClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, doc, getDoc, getDocs, collection, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// Read Firebase Config safely
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = null;
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
const clientApp = firebaseConfig ? initClientApp(firebaseConfig) : null;
const clientDb = clientApp ? getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId) : null;

let db: any = null;

// Initialize Firebase Admin SDK (used for admin-only operations)
function initFirebase() {
  if (db) return db;
  
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
    db = getFirestore(app, dbId);
    
    return db;
  } catch (err) {
    console.error("Firebase Admin initialization failed:", err);
    return null;
  }
}

// Initial attempt for admin operations
initFirebase();

async function startServer() {
  console.log("Starting server process...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  const resend = new Resend(process.env.RESEND_API_KEY || "re_EvsqBCv6_Q9Qfe6jBsEErweyqMHJu8LtF");

  // Cloudinary Configuration
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.VITE_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Check if Cloudinary credentials exist
      const hasCloudinary = 
        process.env.VITE_CLOUDINARY_CLOUD_NAME && 
        process.env.VITE_CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET;

      if (hasCloudinary) {
        try {
          const folderPath = req.body.folder || "zarco-studio";
          console.log(`Cloudinary configuration found, attempting upload to folder: ${folderPath}`);
          const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
          
          const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
            folder: folderPath,
          });

          return res.json({ url: uploadResponse.secure_url });
        } catch (cloudinaryError: any) {
          console.error("Cloudinary upload failed, falling back to local storage:", cloudinaryError);
        }
      } else {
        console.log("Cloudinary credentials not provided/configured - using local storage fallback.");
      }

      // Fallback: Save file locally in the public/uploads directory
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname) || ".jpg";
      const uniqueName = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      fs.writeFileSync(filePath, req.file.buffer);
      console.log(`Saved file locally to: ${filePath}`);

      // Return a path that is served statically by express
      return res.json({ url: `/uploads/${uniqueName}` });
    } catch (error: any) {
      console.error("Local file save error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Newsletter Subscription Route - Now using Client SDK for better reliability
  app.post("/api/subscribe", async (req, res) => {
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
         : "All rights reserved."  
      
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
          ${logoUrl ? `<div style="text-align: left; margin-bottom: 30px;"><img src="${logoUrl}" alt="Logo" style="max-height: 80px;"></div>` : '<div style="text-align: left; margin-bottom: 30px; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">ZARCO STUDIOS</div>'}
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

  // Toggle Subscriber Status (Removed backend logic as it is now handled by frontend Client SDK)
  app.post("/api/admin/subscribers/toggle-status", async (req, res) => {
    res.status(410).json({ error: "Deprecated. Use Client SDK directly." });
  });

  // Newsletter Send Route (Admin Only) - Using Client SDK
  app.post("/api/admin/send-newsletter", async (req, res) => {
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
            ${logoUrl ? `<div style="text-align: left; margin-bottom: 30px;"><img src="${logoUrl}" alt="Logo" style="max-height: 60px;"></div>` : '<div style="text-align: left; margin-bottom: 30px; font-size: 20px; font-weight: bold; text-transform: uppercase;">ZARCO STUDIOS</div>'}
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
  app.get("/api/unsubscribe", async (req, res) => {
    const { email, lang } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).send("Invalid request: Email missing.");
    }

    const collectionName = lang === "pt" ? "pt_subscribers" : "subscribers";

    if (!db) initFirebase();
    if (!db) {
      return res.status(500).send("Database error. Please try again later.");
    }

    try {
      const subRef = db.collection(collectionName).doc(email);
      const docSnap = await subRef.get();

      if (docSnap.exists) {
        await subRef.set({ active: false }, { merge: true });
      } else if (lang !== "all") {
        // Try the other collection just in case
        const altCollection = lang === "pt" ? "subscribers" : "pt_subscribers";
        const altRef = db.collection(altCollection).doc(email);
        const altSnap = await altRef.get();
        if (altSnap.exists) {
          await altRef.set({ active: false }, { merge: true });
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

  // Proxy the unsubscribe landing page to the API route for easy linking
  app.get("/unsubscribe", (req, res) => {
    res.redirect(`/api/unsubscribe?${new URLSearchParams(req.query as any).toString()}`);
  });

  
  // Contact Form Submission API
  app.post("/api/contact", async (req, res) => {
    const { name, company, email, phone, details, isSharedPage } = req.body;

    if (!name || !email || !details) {
      return res.status(400).json({ error: "Missing required fields (name, email, details)" });
    }

    try {
      const isImportant = !!isSharedPage;
      let subject = `New Contact Form Submission from ${name} (${company || "Individual"})`;
      if (isImportant) {
        subject = `🔴 [IMPORTANT - CLIENT PORTAL] ${subject}`;
      }

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
          <div style="text-align: left; margin-bottom: 30px; font-size: 20px; font-weight: bold; text-transform: uppercase; color: #4fd1dc; letter-spacing: 2px;">
            ZARCO STUDIOS CONTACT
          </div>
          ${isImportant ? `
            <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 12px 16px; border-radius: 6px; font-weight: bold; margin-bottom: 25px; font-size: 13px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, sans-serif;">
              ⚠️ IMPORTANT: Message sent by Client from Shared Portal page
            </div>
          ` : ''}
          <div style="background-color: #f9f9f9; padding: 40px; border-radius: 10px; border: 1px solid #eee;">
            <h2 style="color: #22d3ee; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">New Inquiry</h2>
            <p style="font-size: 12px; color: #666; margin-top: -10px; margin-bottom: 20px; font-style: italic;">
              * ${isImportant ? 'This message was sent via the Client Space / Shared Portal on your website.' : 'This message was sent via the contact form on your website.'}
            </p>
            <p><strong>Name:</strong> ${name}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #4fd1dc;">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>Message / Requirements:</strong></p>
            <p style="white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; font-style: italic;">${details}</p>
          </div>
          <div style="font-size: 11px; color: #999; text-align: center; margin-top: 40px;">
            <p>&copy; 2026 Zarco Studios. All rights reserved.</p>
          </div>
        </div>
      `;

      let emailStatus = "unknown";
      let emailErrorDetails: any = null;

      try {
        const emailResponse = await resend.emails.send({
          from: 'Zarco Studios Website <noreply@zarcostudios.com>',
          to: ['pedro.cristo.webdeveloper@gmail.com'], // send to administrator
          replyTo: email,
          subject: subject,
          html: htmlContent,
        });

        if (emailResponse.error) {
          emailStatus = "failed";
          emailErrorDetails = emailResponse.error;
          console.error("Resend API rejected the contact form email with error:", JSON.stringify(emailResponse.error, null, 2));
        } else {
          emailStatus = "sent";
          console.log("Resend API sent contact form email successfully:", emailResponse.data);
        }
      } catch (emailErr: any) {
        emailStatus = "error";
        emailErrorDetails = { message: emailErr.message, name: emailErr.name };
        console.warn("Resend failed to execute send, but we logged contact request:", emailErr);
      }

      res.status(200).json({ 
        success: true, 
        message: "Thank you for contacting us! We will get back to you shortly.",
        emailStatus,
        emailError: emailErrorDetails
      });
    } catch (error: any) {
      console.error("Contact API error:", error);
      res.status(500).json({ error: "Failed to send message", detail: error.message });
    }
  });

  // Subscription Payment Confirmation Route
  app.post("/api/subscriptions/confirm-payment", async (req, res) => {
    const { 
      projectId, 
      clientEmail, 
      clientName, 
      projectName, 
      subscriptionTitle, 
      subscriptionPrice, 
      subscriptionInterval, 
      transactionId, 
      lang 
    } = req.body;

    if (!projectId || !clientEmail) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
      const isPt = lang === "pt";
      const paidAtStr = new Date().toISOString();

      if (!db) initFirebase();
      
      // Update Database via Admin SDK
      if (db) {
        console.log(`[Server] Updating db subscription status for project ${projectId}`);
        const projRef = db.collection("clientProjects").doc(projectId);
        await projRef.set({
          subscriptionPaid: true,
          subscriptionPaidAt: paidAtStr
        }, { merge: true });
        console.log("[Server] Database write succeeded via Admin SDK.");
      } else {
        console.warn("[Server] Firebase Admin SDK is not initialized, skipped database merge.");
      }

      // Calculate next payment date
      const paidDate = new Date(paidAtStr);
      if (subscriptionInterval === "yearly") {
        paidDate.setFullYear(paidDate.getFullYear() + 1);
      } else {
        paidDate.setMonth(paidDate.getMonth() + 1);
      }
      const formattedNextDate = paidDate.toLocaleDateString(isPt ? 'pt-PT' : 'en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // 1. Email to customer
      const clientSubject = isPt 
        ? "Subscrição Ativada com Sucesso - Zarco Studios" 
        : "Subscription Activated Successfully - Zarco Studios";

      const clientTitle = isPt ? "A sua subscrição está ativa!" : "Your subscription is now active!";
      const clientIntro = isPt 
        ? `Olá ${clientName || "Cliente"},<br>Confirmamos com sucesso o pagamento da sua subscrição com a Zarco Studios. Obrigado pela confiança!`
        : `Hello ${clientName || "Valued Client"},<br>We have successfully processed your subscription payment with Zarco Studios. Thank you for your trust!`;

      const detailsHeader = isPt ? "Detalhes da Assinatura" : "Subscription Details";
      const projectLabel = isPt ? "Projeto" : "Project";
      const planLabel = isPt ? "Plano" : "Plan";
      const valueLabel = isPt ? "Valor" : "Rate";
      const cycleLabel = isPt ? "Frequência" : "Billing Cycle";
      const cycleValue = subscriptionInterval === "yearly" ? (isPt ? "Anual" : "Yearly") : (isPt ? "Mensal" : "Monthly");
      const transactionLabel = isPt ? "ID da Transação" : "Transaction ID";
      const nextDueLabel = isPt ? "Próximo Pagamento" : "Next Payment Due";
      const statusLabel = isPt ? "Estado" : "Status";
      const activeText = isPt ? "Ativo" : "Active";
      const thankYouFooter = isPt 
        ? "Caso tenha alguma dúvida, entre em contacto direto através do canal Slack do projeto ou responda à nossa equipa técnica."
        : "If you have any questions, reach out via your dedicated Slack channel or contact our technical team.";

      const clientHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
          <div style="text-align: left; margin-bottom: 30px; font-size: 20px; font-weight: bold; text-transform: uppercase; color: #22d3ee; letter-spacing: 2px;">
            ZARCO STUDIOS
          </div>
          <div style="background-color: #0c1417; color: #fff; padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
            <h2 style="color: #22d3ee; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; font-size: 20px; font-weight: 900;">${clientTitle}</h2>
            <p style="font-size: 14px; text-transform: none; color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 25px;">${clientIntro}</p>
            
            <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 16px; margin-bottom: 25px;">
              <h3 style="color: rgba(255,255,255,0.4); text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">${detailsHeader}</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px; width: 140px;">${projectLabel}</td>
                  <td style="padding: 6px 0; color: #fff; font-weight: bold;">${projectName || "Zarco Project"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">${planLabel}</td>
                  <td style="padding: 6px 0; color: #fff; font-weight: bold;">${subscriptionTitle || "Recurring Service"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">${valueLabel}</td>
                  <td style="padding: 6px 0; color: #22d3ee; font-weight: 900;">€${Number(subscriptionPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">${cycleLabel}</td>
                  <td style="padding: 6px 0; color: #fff;">${cycleValue}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">${transactionLabel}</td>
                  <td style="padding: 6px 0; color: rgba(255,255,255,0.6); font-family: monospace;">${transactionId || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">${nextDueLabel}</td>
                  <td style="padding: 6px 0; color: #4fd1dc; font-weight: bold;">${formattedNextDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">${statusLabel}</td>
                  <td style="padding: 6px 0; color: #10b981; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">● ${activeText}</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.6; margin: 0;">
              ${thankYouFooter}
            </p>
          </div>
          <div style="font-size: 11px; color: #999; text-align: center; margin-top: 30px;">
            <p>&copy; 2026 Zarco Studios. All rights reserved.</p>
          </div>
        </div>
      `;

      // 2. Email to Pedro
      const pedroSubject = `🔔 [Nova Subscrição] ${projectName || "Sem Nome"} - €${subscriptionPrice || "0"}`;
      const pedroHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
          <div style="text-align: left; margin-bottom: 25px; font-size: 20px; font-weight: bold; text-transform: uppercase; color: #ec4899; letter-spacing: 2px;">
            ZARCO STUDIOS ADMIN
          </div>
          <div style="background-color: #0f172a; color: #fff; padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="background-color: rgba(236,72,153,0.1); border: 1px solid #ec4899; color: #f472b6; padding: 10px 15px; border-radius: 8px; font-weight: bold; margin-bottom: 25px; font-size: 12px; display: inline-block;">
              ⚡ NOVA ASSINATURA ATIVADA
            </div>
            <h2 style="color: #fff; margin-top: 0; font-size: 20px; font-weight: 800;">Detalhes da Nova Subscrição</h2>
            
            <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 16px; margin-top: 20px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px; width: 140px;">Projeto</td>
                  <td style="padding: 8px 0; color: #fff; font-weight: bold;">${projectName || "Sem Nome"} (ID: ${projectId})</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">Cliente</td>
                  <td style="padding: 8px 0; color: #fff; font-weight: bold;">${clientName || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">E-mail do Cliente</td>
                  <td style="padding: 8px 0; color: #4fd1dc;"><a href="mailto:${clientEmail}" style="color: #4fd1dc; text-decoration: underline;">${clientEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">Plano Escolhido</td>
                  <td style="padding: 8px 0; color: #fff;">${subscriptionTitle || "Sem título informado"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">Valor Recorrente</td>
                  <td style="padding: 8px 0; color: #e11d48; font-weight: 900;">€${Number(subscriptionPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} / ${subscriptionInterval || "monthly"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">Stripe Txn ID</td>
                  <td style="padding: 8px 0; color: #fbbf24; font-family: monospace;">${transactionId || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">Próxima Cobrança</td>
                  <td style="padding: 8px 0; color: #34d399; font-weight: bold;">${formattedNextDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-weight: bold; text-transform: uppercase; font-size: 10px;">Data de Ativação</td>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.7);">${new Date(paidAtStr).toLocaleString('pt-PT')} (Servidor)</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 11px; color: rgba(255,255,255,0.4); text-align: center; margin-top: 30px; margin-bottom: 0;">
              IP de Ingress: ${req.ip || "Unknown"} • Enviado automaticamente pelo servidor Zarco Studios.
            </p>
          </div>
        </div>
      `;

      // Safe, robust independent email sending with fallback mechanisms
      let clientEmailStatus = "not_sent";
      let adminEmailStatus = "not_sent";

      // 1. Send Email to Customer
      try {
        console.log(`[Server] Attempting client email to ${clientEmail}`);
        let clientResponse = await resend.emails.send({
          from: 'Zarco Studios <hello@zarcostudios.com>',
          to: [clientEmail],
          subject: clientSubject,
          html: clientHtml,
        });

        // Fallback if domain is unverified/rejected (e.g., error is returned)
        if (clientResponse.error) {
          console.warn("[Server] Client email failed using custom domain. Retrying with onboarding@resend.dev...", clientResponse.error);
          clientResponse = await resend.emails.send({
            from: 'Zarco Studios <onboarding@resend.dev>',
            to: [clientEmail],
            subject: clientSubject,
            html: clientHtml,
          });
        }

        if (clientResponse.error) {
          console.error("[Server] Client email failed completely:", clientResponse.error);
          clientEmailStatus = `failed: ${JSON.stringify(clientResponse.error)}`;
        } else {
          console.log("[Server] Client email sent successfully:", clientResponse.data);
          clientEmailStatus = "sent";
        }
      } catch (clientErr: any) {
        console.error("[Server] Exception while sending client email:", clientErr);
        clientEmailStatus = `error: ${clientErr.message}`;
      }

      // 2. Send Email to Pedro (Admin)
      try {
        console.log(`[Server] Attempting admin email to pedro.cristo.webdeveloper@gmail.com`);
        let adminResponse = await resend.emails.send({
          from: 'Zarco Studios Server <noreply@zarcostudios.com>',
          to: ['pedro.cristo.webdeveloper@gmail.com'],
          subject: pedroSubject,
          html: pedroHtml,
        });

        // Fallback if domain is unverified/rejected
        if (adminResponse.error) {
          console.warn("[Server] Admin email failed using custom domain. Retrying with onboarding@resend.dev...", adminResponse.error);
          adminResponse = await resend.emails.send({
            from: 'Zarco Studios Server <onboarding@resend.dev>',
            to: ['pedro.cristo.webdeveloper@gmail.com'],
            subject: pedroSubject,
            html: pedroHtml,
          });
        }

        if (adminResponse.error) {
          console.error("[Server] Admin email failed completely:", adminResponse.error);
          adminEmailStatus = `failed: ${JSON.stringify(adminResponse.error)}`;
        } else {
          console.log("[Server] Admin email sent successfully:", adminResponse.data);
          adminEmailStatus = "sent";
        }
      } catch (adminErr: any) {
        console.error("[Server] Exception while sending admin email:", adminErr);
        adminEmailStatus = `error: ${adminErr.message}`;
      }

      res.status(200).json({ 
        success: true, 
        message: "Payment processed, DB synchronized, and emails processed.",
        paidAt: paidAtStr,
        clientEmailStatus,
        adminEmailStatus
      });

    } catch (error: any) {
      console.error("[Server] Error confirming payment:", error);
      res.status(500).json({ error: error.message || "Failed to confirm payment" });
    }
  });

  // API routes go here
  app.get("/api/health", (req, res) => {
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

  // Statically serve uploaded files from physical public/uploads directory
  app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
