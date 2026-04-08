import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender_type: {
      type: String,
      enum: ['user', 'staff'],
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    image_url: {
      type: String,
      default: '',
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
