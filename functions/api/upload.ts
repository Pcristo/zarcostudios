async function generateCloudinarySignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + apiSecret;
  
  // SHA-1 digest using native Web Crypto API (fully supported on Cloudflare Workers/Pages)
  const msgUint8 = new TextEncoder().encode(signatureString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context: any) {
  const env = context.env || {};
  try {
    const formData = await context.request.formData();
    const file: any = formData.get("file");
    const folder = (formData.get("folder") || "zarco-studio") as string;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    const hasCloudinary = !!(cloudName && apiKey && apiSecret);

    if (hasCloudinary) {
      try {
        const timestamp = String(Math.floor(Date.now() / 1000));
        
        // Generate signature
        const signature = await generateCloudinarySignature({ folder, timestamp }, apiSecret);

        // Build a fresh multipart formData to post to Cloudinary REST endpoint
        const cloudinaryForm = new FormData();
        cloudinaryForm.append("file", file);
        cloudinaryForm.append("folder", folder);
        cloudinaryForm.append("timestamp", timestamp);
        cloudinaryForm.append("api_key", apiKey);
        cloudinaryForm.append("signature", signature);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        
        const res = await fetch(cloudinaryUrl, {
          method: "POST",
          body: cloudinaryForm,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Cloudinary REST API error: ${res.status} ${errorText}`);
        }

        const uploadResponse = await res.json();

        return new Response(JSON.stringify({ url: uploadResponse.secure_url }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (cloudinaryError: any) {
        console.error("Cloudinary upload failed:", cloudinaryError);
        return new Response(JSON.stringify({ error: "Cloudinary upload failed", detail: cloudinaryError.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Cloudinary configuration is missing and local filesystem is not supported on Cloudflare" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
