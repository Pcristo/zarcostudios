import { Router } from "express";
import path from "path";
import fs from "fs";
import { upload, cloudinary, hasCloudinary } from "../services/cloudinary";

const router = Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check if Cloudinary credentials exist
    if (hasCloudinary()) {
      try {
        const folderPath = req.body.folder || "zarco-studio";
        console.log(`Cloudinary configuration found, attempting upload to folder: ${folderPath}`);
        const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        
        const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
          folder: folderPath,
        });

        return res.json({ url: uploadResponse.secure_url });
      } catch (cloudinaryError: any) {
        console.error("Cloudinary upload failed, falling back to local storage:", cloudinaryError);
      }
    } else {
      console.log("Cloudinary credentials not provided/configured - using local storage fallback.");
    }

    // Fallback: Save file locally in the public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(req.file.originalname) || ".jpg";
    const uniqueName = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, req.file.buffer);
    console.log(`Saved file locally to: ${filePath}`);

    // Return a path that is served statically by express
    return res.json({ url: `/uploads/${uniqueName}` });
  } catch (error: any) {
    console.error("Local file save error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
