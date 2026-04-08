import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image_url: { type: String, required: true },
    link_url: { type: String, default: "" },
    position: { type: String, default: "hero" },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

bannerSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.imageUrl = ret.image_url;
    ret.linkUrl = ret.link_url;
    ret.sortOrder = ret.sort_order;
    ret.isActive = ret.is_active;
    ret.startDate = ret.start_date;
    ret.endDate = ret.end_date;
    delete ret._id;
    delete ret.__v;
    // Xóa các trường snake_case cũ
    delete ret.image_url;
    delete ret.link_url;
    delete ret.sort_order;
    delete ret.is_active;
    delete ret.start_date;
    delete ret.end_date;
    return ret;
  },
});

export default mongoose.model("Banner", bannerSchema);
