import { Resend } from "resend";

export function getResendClient(env: any): Resend {
  const apiKey = env.RESEND_API_KEY || "re_EvsqBCv6_Q9Qfe6jBsEErweyqMHJu8LtF";
  return new Resend(apiKey);
}
