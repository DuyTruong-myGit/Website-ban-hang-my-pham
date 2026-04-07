import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: function() {
        // Chỉ bắt buộc nếu không dùng OAuth
        return !this.oauth || (!this.oauth.google_id && !this.oauth.facebook_id);
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar_url: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'staff'],
      default: 'customer',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    oauth: {
      google_id: String,
      facebook_id: String,
    },
    last_login: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Middleware để xử lý trước khi lưu (ví dụ: băm mật khẩu sẽ được thực hiện ở controller hoặc middleware riêng)

const User = mongoose.model('User', userSchema);

export default User;
