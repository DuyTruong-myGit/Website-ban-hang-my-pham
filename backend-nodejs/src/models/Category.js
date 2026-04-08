import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    image_url: { type: String, default: "" },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

categorySchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.imageUrl = ret.image_url;
    ret.parentId = ret.parent_id;
    ret.sortOrder = ret.sort_order;
    ret.isActive = ret.is_active;
    delete ret._id;
    delete ret.__v;
    delete ret.image_url;
    delete ret.parent_id;
    delete ret.sort_order;
    delete ret.is_active;
    return ret;
  },
});

export default mongoose.model("Category", categorySchema);
