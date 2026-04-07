import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

// Kết nối Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Xử lý lỗi Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.log(`[Error] Unhandled Rejection: ${err.message}`);
  // Đóng server & thoát
  server.close(() => process.exit(1));
});
