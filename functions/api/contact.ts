import { Resend } from "resend";

export async function onRequestPost(context: any) {
  const env = context.env || {};
  try {
    const body = await context.request.json();
    const { name, company, email, phone, details, isSharedPage } = body;

    if (!name || !email || !details) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (name, email, details)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
      const apiKey = env.RESEND_API_KEY || "re_EvsqBCv6_Q9Qfe6jBsEErweyqMHJu8LtF";
      const resend = new Resend(apiKey);
      const emailResponse = await resend.emails.send({
        from: 'Zarco Studios Website <noreply@zarcostudios.com>',
        to: ['pedro.cristo.webdeveloper@gmail.com'],
        replyTo: email,
        subject: subject,
        html: htmlContent,
      });

      if (emailResponse.error) {
        emailStatus = "failed";
        emailErrorDetails = emailResponse.error;
        console.error("Resend API rejected the contact form email:", emailResponse.error);
      } else {
        emailStatus = "sent";
      }
    } catch (emailErr: any) {
      emailStatus = "error";
      emailErrorDetails = { message: emailErr.message, name: emailErr.name };
      console.warn("Resend failed to execute send, but we logged contact request:", emailErr);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Thank you for contacting us! We will get back to you shortly.",
        emailStatus,
        emailError: emailErrorDetails
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Contact API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send message", detail: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
