import rateLimit from "express-rate-limit";
import crypto from "crypto";
import logger from "../utils/logger.js";

const isProd = process.env.NODE_ENV === "production";
const secret = process.env.RL_SECRET || "change-me-in-production";

if (isProd && secret === "change-me-in-production") {
  throw new Error("RL_SECRET must be set in production");
}

const normalizeIp = (ip) => (ip === "::1" ? "127.0.0.1" : ip || "unknown");
const getClientIp = (req) => normalizeIp(req.ip);
const normEmail = (e = "") => String(e).toLowerCase().trim();
const hashEmail = (e = "") =>
  crypto.createHmac("sha256", secret).update(normEmail(e)).digest("base64url");
const maskEmail = (e = "") =>
  e ? e.replace(/(^.{2}).*(@.*$)/, "$1***$2") : "unknown";

const shouldSkip = (req) => {
  if (!isProd || process.env.RATE_LIMIT_DISABLED === "1") return true;
  if (req.method === "OPTIONS") return true;
  return false;
};

const makeLimiter = ({
  windowMs,
  max,
  keyGenerator,
  code,
  message,
  skipSuccessful,
}) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    skip: shouldSkip,
    skipSuccessfulRequests: skipSuccessful || false,
    handler: (req, res) => {
      const ip = getClientIp(req);
      const emailMasked = maskEmail(req.body?.email || "");

      const retryMs =
        req.rateLimit?.msBeforeNext ??
        (req.rateLimit?.resetTime
          ? Math.max(
              0,
              new Date(req.rateLimit.resetTime).getTime() - Date.now(),
            )
          : windowMs);

      const retryAfterSec = Math.max(1, Math.ceil(retryMs / 1000));

      logger.warn(
        `${code} exceeded ip=${ip} email=${emailMasked} path=${req.originalUrl} ua=${req.get("User-Agent")}`,
      );

      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: message,
        code,
        retryAfter: retryAfterSec,
      });
    },
  });

const emailAwareKey = (req) =>
  `${getClientIp(req)}:${hashEmail(req.body?.email || "")}`;
const ipOnlyKey = (req) => getClientIp(req);

export const apiLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 600,
  keyGenerator: ipOnlyKey,
  code: "API_RATE_LIMIT_EXCEEDED",
  message: "Too many requests. Please slow down.",
});

export const authLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: emailAwareKey,
  code: "RATE_LIMIT_EXCEEDED",
  message: "Zbyt wiele prób logowania. Spróbuj ponownie później.",
  skipSuccessful: true,
});

export const adminLoginLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: emailAwareKey,
  code: "ADMIN_RATE_LIMIT_EXCEEDED",
  message:
    "Zbyt wiele prób logowania w panelu administracyjnym. Spróbuj ponownie później.",
  skipSuccessful: true,
});

export const passwordResetLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: emailAwareKey,
  code: "PASSWORD_RESET_LIMIT_EXCEEDED",
  message: "Zbyt wiele prób resetowania hasła. Spróbuj ponownie później.",
});

export const registrationLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: emailAwareKey,
  code: "REGISTRATION_LIMIT_EXCEEDED",
  message: "Zbyt wiele prób rejestracji. Spróbuj ponownie później.",
});

export const registrationStep2Limiter = makeLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyGenerator: emailAwareKey,
  code: "REGISTRATION_STEP2_LIMIT_EXCEEDED",
  message: "Zbyt wiele prób weryfikacji email. Spróbuj ponownie za kilka minut.",
});

export const registrationStep3Limiter = makeLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    const phone = req.body?.phone || "";
    return `${getClientIp(req)}:${crypto
      .createHmac("sha256", secret)
      .update(phone.trim())
      .digest("base64url")}`;
  },
  code: "REGISTRATION_STEP3_LIMIT_EXCEEDED",
  message: "Zbyt wiele prób weryfikacji telefonu. Spróbuj ponownie za kilka minut.",
});

export const registrationStep4Limiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: ipOnlyKey,
  code: "REGISTRATION_STEP4_LIMIT_EXCEEDED",
  message: "Zbyt wiele prób finalizacji rejestracji. Spróbuj ponownie później.",
});

export const messageRateLimiter = makeLimiter({
  windowMs: 5 * 1000,
  max: 1,
  keyGenerator: (req) => req.user?.userId || ipOnlyKey(req),
  code: "MESSAGE_RATE_LIMIT_EXCEEDED",
  message: "Poczekaj chwilę przed wysłaniem kolejnej wiadomości.",
});

export const messageHourlyLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  keyGenerator: (req) => req.user?.userId || ipOnlyKey(req),
  code: "MESSAGE_HOURLY_LIMIT_EXCEEDED",
  message: "Osiągnięto limit wiadomości na godzinę (50). Spróbuj ponownie później.",
});

export const searchLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: ipOnlyKey,
  code: "SEARCH_RATE_LIMIT_EXCEEDED",
  message: "Zbyt wiele zapytań wyszukiwania. Zwolnij tempo.",
});

export const metadataLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: ipOnlyKey,
  code: "METADATA_RATE_LIMIT_EXCEEDED",
  message: "Zbyt wiele zapytań o metadane.",
});

export { authLimiter as checkUserRole };

export default {
  authLimiter,
  adminLoginLimiter,
  passwordResetLimiter,
  registrationLimiter,
  registrationStep2Limiter,
  registrationStep3Limiter,
  registrationStep4Limiter,
  apiLimiter,
  messageRateLimiter,
  messageHourlyLimiter,
  searchLimiter,
  metadataLimiter,
};
