/**
 * Utility to verify Google reCAPTCHA v2 token.
 */
export async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY is not defined. Skipping verification.");
    return true; // Skip verification if not configured yet
  }

  if (!token) {
    console.warn("reCAPTCHA token is missing but RECAPTCHA_SECRET_KEY is configured.");
    return false;
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json() as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.error("reCAPTCHA verification failed:", data["error-codes"]);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  }
}
