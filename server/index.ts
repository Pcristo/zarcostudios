import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION at:", promise, "reason:", reason);
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import route modules
import healthRouter from "./routes/health";
import uploadRouter from "./routes/upload";
import contactRouter from "./routes/contact";
import newsletterRouter from "./routes/newsletter";
import subscriptionsRouter from "./routes/subscriptions";

async function startServer() {
  console.log("Starting modular server process...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount API paths
  app.use("/api/health", healthRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/subscriptions", subscriptionsRouter);
  
  // Newsletter has root-level /api paths like /subscribe, /unsubscribe, etc.
  app.use("/api", newsletterRouter);

  // Unsubscribe root proxy
  app.get("/unsubscribe", (req, res) => {
    res.redirect(`/api/unsubscribe?${new URLSearchParams(req.query as any).toString()}`);
  });

  // Statically serve uploaded files from physical public/uploads directory
  app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
