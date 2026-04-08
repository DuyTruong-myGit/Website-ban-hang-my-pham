import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/Hoa Nguyen/Desktop/DoAnCK/cosmetic/Website-ban-hang-my-pham/backend-nodejs/.env' });

const uri = process.env.MONGO_URI;
console.log('Connecting to', uri);

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  const rooms = await db.collection('chatrooms').find({}).toArray();
  console.log('Total rooms:', rooms.length);
  if(rooms.length > 0) {
     console.log('First room:', rooms[0]);
  }
  process.exit(0);
});
