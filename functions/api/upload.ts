import { v2 as cloudinary } from "cloudinary";

export async function onRequestPost(context: any) {
  const env = context.env || {};
  try {
    const formData = await context.request.formData();
    const file: any = formData.get("file");
    const folder = formData.get("folder") || "zarco-studio";

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const hasCloudinary = !!(
      env.VITE_CLOUDINARY_CLOUD_NAME && 
      env.VITE_CLOUDINARY_API_KEY && 
      env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinary) {
      try {
        cloudinary.config({
          cloud_name: env.VITE_CLOUDINARY_CLOUD_NAME,
          api_key: env.VITE_CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_API_SECRET,
        });

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < uint8Array.byteLength; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binary);
        const fileBase64 = `data:${file.type};base64,${base64}`;

        const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
          folder: folder,
        });

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
