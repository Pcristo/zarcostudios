export async function onRequestGet(context: any) {
  const requestUrl = new URL(context.request.url);
  const searchParams = requestUrl.searchParams.toString();
  const redirectUrl = `${requestUrl.protocol}//${requestUrl.host}/api/unsubscribe?${searchParams}`;
  return Response.redirect(redirectUrl, 302);
}
