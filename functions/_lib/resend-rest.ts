export async function sendEmailViaFetch(env: any, payload: { from: string; to: string[]; subject: string; html: string }) {
  const apiKey = env.RESEND_API_KEY || "re_EvsqBCv6_Q9Qfe6jBsEErweyqMHJu8LtF";
  
  // Determine from address
  let fromAddress = payload.from;
  if (env.RESEND_FROM_EMAIL) {
    if (env.RESEND_FROM_EMAIL.includes("<")) {
      fromAddress = env.RESEND_FROM_EMAIL;
    } else {
      const namePart = payload.from.includes("<") ? payload.from.split("<")[0].trim() : "Zarco Studios";
      fromAddress = `${namePart} <${env.RESEND_FROM_EMAIL}>`;
    }
  } else if (!env.RESEND_API_KEY) {
    // If using the default/sandbox Resend API key, we MUST send from onboarding@resend.dev
    fromAddress = "Zarco Studios <onboarding@resend.dev>";
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      ...payload,
      from: fromAddress
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Resend API error: ${res.status} ${errorText}`);
  }

  return await res.json();
}
