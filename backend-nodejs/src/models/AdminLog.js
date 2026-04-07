import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    target: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index — tối ưu query filter theo user + thời gian
adminLogSchema.index({ user_id: 1, created_at: -1 });
adminLogSchema.index({ action: 1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

export default AdminLog;
