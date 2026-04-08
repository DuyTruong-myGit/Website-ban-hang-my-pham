import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    logo_url: { type: String, default: "" },
    description: { type: String, default: "" },
    origin_country: { type: String, default: "" },
    website: { type: String, default: "" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Tự động map snake_case sang camelCase khi trả về JSON cho Frontend
brandSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.logoUrl = ret.logo_url;
    ret.originCountry = ret.origin_country;
    ret.isActive = ret.is_active;
    delete ret._id;
    delete ret.__v;
    delete ret.logo_url;
    delete ret.origin_country;
    delete ret.is_active;
    return ret;
  },
});

export default mongoose.model("Brand", brandSchema);
