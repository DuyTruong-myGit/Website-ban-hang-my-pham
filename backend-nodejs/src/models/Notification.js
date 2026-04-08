import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // If null, maybe it's a global notification? But let's keep it specific
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['system', 'order', 'chat', 'review', 'question'],
      default: 'system',
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    related_id: {
      type: mongoose.Schema.Types.ObjectId, // Could be order_id, room_id, product_id, etc.
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

console.log('Notification Model Initialized');

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
