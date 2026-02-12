const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`Please ensure MongoDB is running or update MONGODB_URI in .env file`);
    console.error(`For MongoDB Atlas: https://cloud.mongodb.com`);
    console.error(`For local MongoDB: Install from https://www.mongodb.com/try/download/community`);
    // Don't exit process - let app run without DB for now
    console.warn(`⚠️  App running WITHOUT database - limited functionality`);
  }
};

module.exports = connectDB;
