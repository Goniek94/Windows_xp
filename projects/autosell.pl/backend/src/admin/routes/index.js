import express from "express";

import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import userRoutes from "./userRoutes.js";
import listingRoutes from "./listingRoutes.js";
import reportRoutes from "./reportRoutes.js";
import promotionRoutes from "./promotionRoutes.js";
import statisticsRoutes from "./statisticsRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import cleanupRoutes from "./cleanupRoutes.js";
import activeListingsRoutes from "./activeListingsRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import activityRoutes from "./activityRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

import { adminApiLimiter, requireAdminAuth } from "../middleware/adminAuth.js";
import trackDailyActive from "../../middleware/analytics/trackDailyActive.js";

const router = express.Router();
router.use(adminApiLimiter);

router.get("/health", (req, res) => {
  res.json({ success: true, service: "Admin Panel", version: "1.0.0", user: req.user || null });
});

router.use("/auth", authRoutes);
router.use("/dashboard", requireAdminAuth, trackDailyActive, dashboardRoutes);
router.use("/users", requireAdminAuth, trackDailyActive, userRoutes);
router.use("/listings", requireAdminAuth, trackDailyActive, activeListingsRoutes);
router.use("/listings", requireAdminAuth, trackDailyActive, listingRoutes);
router.use("/payments", requireAdminAuth, trackDailyActive, paymentRoutes);
router.use("/reports", (req, res) => res.redirect(308, `/admin/payments${req.url || ""}`));
router.use("/promotions", requireAdminAuth, trackDailyActive, promotionRoutes);
router.use("/settings", requireAdminAuth, trackDailyActive, settingsRoutes);
router.use("/statistics", requireAdminAuth, trackDailyActive, statisticsRoutes);
router.use("/analytics", requireAdminAuth, trackDailyActive, analyticsRoutes);
router.use("/activity", requireAdminAuth, trackDailyActive, activityRoutes);
router.use("/notifications", requireAdminAuth, trackDailyActive, notificationRoutes);
router.use("/", requireAdminAuth, cleanupRoutes);

router.use("*", (req, res) => {
  res.status(404).json({ success: false, error: "Admin endpoint not found", path: req.originalUrl });
});

export default router;
