export async function onRequestGet(context: any) {
  return new Response(
    JSON.stringify({ 
      status: "active",
      message: "Zarco Studios Subscriptions API is operational. Use /api/subscriptions/confirm-payment to confirm customer payments." 
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
