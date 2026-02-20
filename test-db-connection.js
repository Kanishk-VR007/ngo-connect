const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('=== MongoDB Connection Diagnostic ===\n');
console.log('1. Environment Variables Check:');
console.log(`   - MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);
console.log(`   - Connection string: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT FOUND'}\n`);

// Extract components from connection string
if (process.env.MONGODB_URI) {
    const uri = process.env.MONGODB_URI;
    console.log('2. Connection String Analysis:');
    console.log(`   - Protocol: ${uri.startsWith('mongodb+srv://') ? 'mongodb+srv (Atlas)' : uri.startsWith('mongodb://') ? 'mongodb (Standard)' : 'INVALID'}`);
    console.log(`   - Has database name: ${uri.includes('/?') ? 'NO - Missing database name' : 'YES'}`);
    console.log(`   - Full URI: ${uri}\n`);

    // Check for common issues
    console.log('3. Common Issues Check:');
    if (uri.includes('/?appName=')) {
        console.log('   ⚠️  WARNING: Database name is missing before query parameters');
        console.log('      Current format: ...mongodb.net/?appName=...');
        console.log('      Should be:      ...mongodb.net/DATABASE_NAME?appName=...');
    }
    if (uri.includes('%')) {
        console.log('   ℹ️  INFO: URL-encoded characters detected in password');
        console.log('      Make sure special characters are properly encoded:');
        console.log('      @ = %40, $ = %24, : = %3A, / = %2F, ? = %3F, # = %23, [ = %5B, ] = %5D');
    }
}

console.log('\n4. Attempting Connection...\n');

// Test connection
const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✓ SUCCESS: MongoDB Connected!');
        console.log(`   - Host: ${conn.connection.host}`);
        console.log(`   - Database: ${conn.connection.name || 'test (default)'}`);
        console.log(`   - Connection state: ${conn.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);

        // Test a simple operation
        const collections = await conn.connection.db.listCollections().toArray();
        console.log(`   - Available collections: ${collections.length}`);
        if (collections.length > 0) {
            console.log(`   - Collection names: ${collections.map(c => c.name).join(', ')}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('✗ ERROR: MongoDB Connection Failed!\n');
        console.error(`Error Type: ${error.name}`);
        console.error(`Error Message: ${error.message}\n`);

        // Provide specific guidance based on error
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.error('Diagnosis: DNS/Network issue');
            console.error('Solutions:');
            console.error('  1. Check your internet connection');
            console.error('  2. Verify the cluster hostname is correct');
            console.error('  3. Ensure no firewall is blocking MongoDB ports (27017)');
        } else if (error.message.includes('Authentication failed') || error.message.includes('auth')) {
            console.error('Diagnosis: Authentication issue');
            console.error('Solutions:');
            console.error('  1. Verify username and password are correct');
            console.error('  2. Check if password contains special characters (they must be URL-encoded)');
            console.error('  3. Ensure the database user has proper permissions');
        } else if (error.message.includes('Invalid connection string')) {
            console.error('Diagnosis: Connection string format issue');
            console.error('Solutions:');
            console.error('  1. Add database name: mongodb+srv://user:pass@host/DATABASE_NAME?options');
            console.error('  2. Ensure all special characters in password are URL-encoded');
        } else if (error.message.includes('IP')) {
            console.error('Diagnosis: IP Whitelist issue');
            console.error('Solutions:');
            console.error('  1. Add your current IP to MongoDB Atlas Network Access');
            console.error('  2. Or allow access from anywhere (0.0.0.0/0) for testing');
        }

        console.error('\nFull Error Stack:');
        console.error(error.stack);

        process.exit(1);
    }
};

connectDB();
