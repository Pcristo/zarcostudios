import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "re_EvsqBCv6_Q9Qfe6jBsEErweyqMHJu8LtF");
