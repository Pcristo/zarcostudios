import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripeInstance(): Stripe | null {
  if (stripeInstance) return stripeInstance;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn("[Server] STRIPE_SECRET_KEY is missing! Stripe integration will run in mock/simulator mode.");
    return null;
  }
  // Lazy initialize Stripe
  stripeInstance = new Stripe(key, {
    apiVersion: "2023-10-16" as any
  });
  return stripeInstance;
}

export function translateStripeError(message: string, isPt: boolean): string {
  if (!isPt) return message;
  
  const msgLower = (message || "").toLowerCase();
  
  if (msgLower.includes("sending credit card numbers directly") || msgLower.includes("raw card data") || msgLower.includes("unsafe")) {
    return "O envio direto de dados do cartão de crédito para a API do Stripe não é considerado seguro de acordo com as normas PCI. Por favor, utilize os tokens de teste oficiais para fins de Sandbox ou ative o suporte a dados brutos no painel do Stripe.";
  }
  if (msgLower.includes("was declined") || msgLower.includes("declined")) {
    return "O seu cartão de crédito foi recusado.";
  }
  if (msgLower.includes("security code is incorrect") || msgLower.includes("cvc is incorrect") || msgLower.includes("cvc_incorrect")) {
    return "O código de segurança (CVC) do seu cartão está incorreto.";
  }
  if (msgLower.includes("expiration year is invalid") || msgLower.includes("invalid_expiry_year")) {
    return "O ano de validade do seu cartão de crédito é inválido.";
  }
  if (msgLower.includes("expiration month is invalid") || msgLower.includes("invalid_expiry_month")) {
    return "O mês de validade do seu cartão de crédito é inválido.";
  }
  if (msgLower.includes("card has expired") || msgLower.includes("expired_card")) {
    return "O seu cartão de crédito expirou.";
  }
  if (msgLower.includes("incorrect_number") || msgLower.includes("card number is incorrect")) {
    return "O número do cartão de crédito introduzido está incorreto.";
  }
  if (msgLower.includes("invalid_number") || msgLower.includes("card number is invalid")) {
    return "O número do cartão de crédito introduzido é inválido.";
  }
  if (msgLower.includes("insufficient_funds") || msgLower.includes("insufficient funds")) {
    return "Saldo insuficiente no cartão de crédito fornecido.";
  }
  if (msgLower.includes("processing_error") || msgLower.includes("processing your card")) {
    return "Ocorreu um erro ao processar o seu cartão de crédito. Por favor, tente novamente.";
  }
  
  return message;
}
