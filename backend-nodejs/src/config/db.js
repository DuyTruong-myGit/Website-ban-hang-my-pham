import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Error] Database connection failed: ${error.message}`);
    process.exit(1); // Thoát nếu không kết nối được DB
  }
};

export default connectDB;
