import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://gani_subratha:gani%40123@subratha.6vwhw8z.mongodb.net/?appName=subratha";

await mongoose.connect(MONGO_URI);
console.log('✅ Connected to MongoDB');

const result = await mongoose.connection.collection('orders').deleteMany({});
console.log(`🗑️  Deleted ${result.deletedCount} orders`);

await mongoose.disconnect();
console.log('✅ Done.');
