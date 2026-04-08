import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

wishlistSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.userId = ret.user_id;
    delete ret._id;
    delete ret.__v;
    delete ret.user_id;
    delete ret.created_at;
    delete ret.updated_at;
    return ret;
  }
});

export default mongoose.model('Wishlist', wishlistSchema);
