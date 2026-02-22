import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import fs from "fs";
import mongoSanitize from "express-mongo-sanitize";

import config from "./config/index.js";
import logger from "./utils/logger.js";
import setupRoutes from "./routes/index.js";
import headerSizeMonitor from "./middleware/headerSizeMonitor.js";
import { cookieSizeMonitor } from "./middleware/cookieCleanup.js";
import { apiLimiter } from "./middleware/rateLimiting.js";

const isProd = process.env.NODE_ENV === "production";

const createApp = () => {
  const app = express();
  app.set("trust proxy", 1);

  app.use((req, res, next) => {
    const contentType = req.get("Content-Type") || "";
    const url = req.originalUrl || req.url;

    if (contentType.includes("multipart/form-data")) return next();
    if (req.method === "POST" && url.match(/^\/api\/comments\/[^\/]+$/)) {
      return next();
    }

    express.json({ limit: "2mb", strict: true, type: "application/json" })(
      req,
      res,
      () => {
        express.urlencoded({
          limit: "2mb",
          extended: true,
          parameterLimit: 100,
          type: "application/x-www-form-urlencoded",
        })(req, res, next);
      },
    );
  });

  app.use(mongoSanitize({ allowDots: false, replaceWith: "_" }));
  app.use(headerSizeMonitor);
  app.use(compression());
  app.use(cookieParser());
  app.use(cookieSizeMonitor);

  app.use(
    cors({
      origin: config.security?.cors?.origin ?? false,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Cache-Control",
        "X-CSRF-Token",
      ],
      exposedHeaders: ["X-Total-Count"],
      maxAge: 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }),
  );

  app.use((_req, res, next) => {
    res.append("Vary", "Origin");
    next();
  });
  app.options("*", (_req, res) => res.sendStatus(204));

  app.use("/api", apiLimiter);
  app.use("/api/v1", apiLimiter);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: isProd
            ? ["'self'", "https://fonts.googleapis.com"]
            : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          mediaSrc: ["'self'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  configureUploads(app);
  setupRoutes(app);

  app.get("/", (_req, res) => res.json({ status: "ok" }));
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  app.use((err, req, res, next) => {
    logger.error("Unhandled error", { msg: err?.message, url: req.originalUrl });
    if (res.headersSent) return next(err);
    const status = err.status || err.statusCode || 500;
    const message = isProd && status === 500 ? "Internal Server Error" : err.message;
    res.status(status).json({ success: false, error: message });
  });

  return app;
};

function configureUploads(app) {
  const uploadsPath = "./uploads";
  try {
    if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
  } catch (e) {
    logger.warn("Upload dir create error", { msg: e.message });
  }

  app.use("/uploads", express.static(uploadsPath));
}

const app = createApp();
export default app;
