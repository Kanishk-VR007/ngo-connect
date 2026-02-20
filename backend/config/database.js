const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    // Set mongoose options for better connection handling
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000, // How long to wait for server selection
      socketTimeoutMS: 45000, // How long socket stays open for operations
      retryWrites: true, // Retry write operations on transient errors
      maxPoolSize: 10, // Connection pool size
      minPoolSize: 2,
      family: 4 // Use IPv4, skip trying IPv6
    });

    isConnected = true;
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✓ Database Name: ${conn.connection.name}`);
    
    // Handle disconnection events
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('✓ MongoDB reconnected');
    });

  } catch (error) {
    isConnected = false;
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    console.error(`\nTroubleshooting steps:`);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('1. Check your internet connection');
      console.error('2. Verify cluster hostname in MONGODB_URI');
      console.error('3. Check if firewall is blocking MongoDB connection (port 27017)');
    } else if (error.message.includes('Authentication failed') || error.message.includes('auth')) {
      console.error('1. Verify username and password in MONGODB_URI');
      console.error('2. Check if password special characters are URL-encoded');
      console.error('3. Verify user permissions at https://cloud.mongodb.com');
    } else if (error.message.includes('IP')) {
      console.error('1. Add your IP to MongoDB Atlas Network Access whitelist');
      console.error('2. Open https://cloud.mongodb.com → Network Access → Add IP Address');
      console.error('3. Or allow 0.0.0.0/0 for all IPs (not recommended for production)');
    }
    
    console.warn(`\n⚠️  App running WITHOUT database - limited functionality`);
    console.error(`\nConnection string (first 30 chars): ${process.env.MONGODB_URI.substring(0, 30)}...`);
  }
};

// Export both connect function and status checker
module.exports = connectDB;
module.exports.isConnected = () => isConnected;
