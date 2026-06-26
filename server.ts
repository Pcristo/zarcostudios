import express from "express";
import path from "path";
import { Readable } from "stream";
import { createServer as createViteServer } from "vite";

// Import all Cloudflare Pages functions as modules
import * as healthFunc from "./functions/api/health";
import * as contactFunc from "./functions/api/contact";
import * as subscribeFunc from "./functions/api/subscribe";
import * as unsubscribeFunc from "./functions/api/unsubscribe";
import * as rootUnsubscribeFunc from "./functions/unsubscribe";
import * as newsletterFunc from "./functions/api/newsletter";
import * as subscriptionsFunc from "./functions/api/subscriptions";
import * as confirmPaymentFunc from "./functions/api/subscriptions/confirm-payment";
import * as sendNewsletterFunc from "./functions/api/admin/send-newsletter";
import * as uploadFunc from "./functions/api/upload";

const app = express();
const PORT = 3000;

// Local adapter to run Cloudflare Pages Functions in the Node.js/Express environment
async function handleCF(funcModule: any, req: express.Request, res: express.Response) {
  try {
    const method = req.method;
    const handlerName = `onRequest${method.charAt(0).toUpperCase()}${method.slice(1).toLowerCase()}`;
    const handler = funcModule[handlerName] || funcModule.onRequest;

    if (!handler) {
      res.status(405).json({ error: `Method ${method} not allowed` });
      return;
    }

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const url = `${protocol}://${host}${req.originalUrl}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const request = new Request(url, {
      method: method,
      headers: headers,
      body: hasBody ? Readable.toWeb(req) as any : undefined,
      // @ts-ignore
      duplex: hasBody ? 'half' : undefined,
    });

    const context = {
      request,
      env: process.env,
      params: req.params,
    };

    const webResponse = await handler(context);

    // Copy response headers
    webResponse.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    res.status(webResponse.status);

    // Read body as ArrayBuffer and send via Express Response
    const arrayBuffer = await webResponse.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error(`Error in function adapter for route ${req.path}:`, error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}

// API Routes
app.all("/api/health", (req, res) => handleCF(healthFunc, req, res));
app.all("/api/contact", (req, res) => handleCF(contactFunc, req, res));
app.all("/api/subscribe", (req, res) => handleCF(subscribeFunc, req, res));
app.all("/api/unsubscribe", (req, res) => handleCF(unsubscribeFunc, req, res));
app.all("/unsubscribe", (req, res) => handleCF(rootUnsubscribeFunc, req, res));
app.all("/api/newsletter", (req, res) => handleCF(newsletterFunc, req, res));
app.all("/api/subscriptions/confirm-payment", (req, res) => handleCF(confirmPaymentFunc, req, res));
app.all("/api/subscriptions", (req, res) => handleCF(subscriptionsFunc, req, res));
app.all("/api/admin/send-newsletter", (req, res) => handleCF(sendNewsletterFunc, req, res));
app.all("/api/upload", (req, res) => handleCF(uploadFunc, req, res));

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
