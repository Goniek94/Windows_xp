import mongoose from "mongoose";

const AdSchema = new mongoose.Schema(
  {
    title: { type: String, required: false, index: true },
    description: { type: String, default: "" },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    headline: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    brand: { type: String, default: "" },
    model: { type: String, default: "" },
    year: { type: Number, default: null },
    mileage: { type: Number, default: null },
    fuelType: { type: String, default: "" },
    transmission: { type: String, default: "" },
    price: { type: Number, required: false, min: 0, default: 0 },
    discount: { type: Number, default: 0, min: 0, max: 99 },
    discountedPrice: { type: Number, default: null },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending_payment", "pending", "approved", "rejected", "active", "hidden", "archived"],
      default: "pending_payment",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, default: null, index: true },
    views: { type: Number, default: 0, min: 0 },
    favorites: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

AdSchema.methods.applyPercentDiscount = function (pct) {
  const p = Number(pct) || 0;
  const clamped = Math.max(0, Math.min(99, p));
  this.discount = clamped;
  this.discountedPrice = clamped > 0 ? Math.round(this.price * (1 - clamped / 100)) : null;
};

AdSchema.methods.extendDays = function (days = 30) {
  const d = Math.max(1, Number(days) || 30);
  const base = this.expiresAt && this.expiresAt > new Date() ? this.expiresAt : new Date();
  const next = new Date(base);
  next.setDate(next.getDate() + d);
  this.expiresAt = next;
};

AdSchema.pre("save", function (next) {
  this.discount = Math.max(0, Math.min(99, Number(this.discount) || 0));
  this.discountedPrice = this.discount > 0 ? Math.round(this.price * (1 - this.discount / 100)) : null;
  next();
});

const Ad = mongoose.model("Ad", AdSchema);
export default Ad;
