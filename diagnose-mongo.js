#!/usr/bin/env node

/**
 * MongoDB Atlas Connection Diagnostic Tool
 * 
 * This script helps diagnose MongoDB Atlas connection issues.
 * Run: node diagnose-mongo.js
 */

const mongoose = require('mongoose');
const dns = require('dns').promises;
const https = require('https');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.blue}${colors.bright}${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`)
};

const MONGODB_URI = process.env.MONGODB_URI;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function dnsLookup(hostname) {
  try {
    const result = await dns.resolve4(hostname);
    return result;
  } catch (error) {
    return null;
  }
}

async function checkInternetConnection() {
  return new Promise((resolve) => {
    https.get('https://www.google.com', { timeout: 5000 }, () => {
      resolve(true);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function parseMongoURI(uri) {
  let protocol, username, password, host, database, options;
  
  try {
    // Updated regex to handle mongodb+srv protocol
    const match = uri.match(
      /^(mongodb(?:\+srv)?)\/\/([^:]+):([^@]+)@([^\/]+?)\/([^?]+)(?:\?(.+))?$/
    );
    
    if (!match) {
      // Try alternative parsing approach
      const parts = uri.replace('mongodb+srv://', '').replace('mongodb://', '');
      const [credentials, rest] = parts.split('@');
      
      if (!credentials || !rest) {
        throw new Error('Invalid URI format - missing @ separator');
      }
      
      const [username_raw, password_raw] = credentials.split(':');
      const [host_raw, dbAndOptions] = rest.split('/');
      const [database_raw, options_raw] = dbAndOptions.split('?');
      
      protocol = uri.includes('mongodb+srv') ? 'mongodb+srv' : 'mongodb';
      username = username_raw;
      password = password_raw;
      host = host_raw;
      database = database_raw;
      options = options_raw ? Object.fromEntries(new URLSearchParams(options_raw)) : {};
      
      return {
        protocol,
        username,
        password,
        decodedPassword: decodeURIComponent(password),
        host,
        database,
        options
      };
    }
    
    [, protocol, username, password, host, database, options] = match;
    
    // Decode the password since it might be URL-encoded
    const decodedPassword = decodeURIComponent(password);
    
    return {
      protocol,
      username,
      password,
      decodedPassword,
      host,
      database,
      options: options ? Object.fromEntries(new URLSearchParams(options)) : {}
    };
  } catch (error) {
    console.error('Parse error:', error.message);
    return null;
  }
}

async function runDiagnostics() {
  log.header('MongoDB Atlas Connection Diagnostic Tool');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Step 1: Check environment
  log.section('1. Environment Check');
  if (!MONGODB_URI) {
    log.error('MONGODB_URI not found in .env file');
    process.exit(1);
  } else {
    log.success('MONGODB_URI is configured');
    log.info(`URI: ${MONGODB_URI.substring(0, 30)}...`);
  }
  
  // Step 2: Parse connection string
  log.section('2. Connection String Analysis');
  const parsed = await parseMongoURI(MONGODB_URI);
  
  if (!parsed) {
    log.error('Could not parse MongoDB URI');
    process.exit(1);
  }
  
  log.success('Connection string is valid');
  log.info(`Protocol: ${parsed.protocol}`);
  log.info(`Username: ${parsed.username}`);
  log.info(`Host: ${parsed.host}`);
  log.info(`Database: ${parsed.database}`);
  log.info(`Decoded Password Length: ${parsed.decodedPassword.length} characters`);
  
  // Step 3: Check for URL-encoded characters
  log.section('3. Password Encoding Check');
  if (parsed.password !== parsed.decodedPassword) {
    log.success('Password is URL-encoded (as expected for MongoDB Atlas)');
    log.info(`Encoded: ${parsed.password}`);
    log.info(`Decoded: ${parsed.decodedPassword}`);
  } else {
    log.warning('Password does not contain URL-encoded characters');
  }
  
  // Step 4: Check internet connection
  log.section('4. Internet Connectivity Check');
  console.log('Checking internet connection...');
  const hasInternet = await checkInternetConnection();
  if (hasInternet) {
    log.success('Internet connection is available');
  } else {
    log.error('No internet connection detected');
    log.warning('Please check your network connection and firewall');
  }
  
  // Step 5: DNS lookup
  log.section('5. DNS Resolution Check');
  console.log(`Resolving ${parsed.host}...`);
  const dnsResults = await dnsLookup(parsed.host);
  if (dnsResults && dnsResults.length > 0) {
    log.success(`DNS resolved successfully`);
    log.info(`IP Address(es): ${dnsResults.join(', ')}`);
  } else {
    log.error(`Could not resolve ${parsed.host}`);
    log.warning('This might indicate:');
    log.warning('  - Cluster hostname is incorrect');
    log.warning('  - DNS server is not responding');
    log.warning('  - Network/firewall is blocking DNS');
  }
  
  // Step 6: Test MongoDB connection
  log.section('6. MongoDB Connection Test');
  console.log('Attempting to connect to MongoDB Atlas...');
  console.log('(This may take up to 30 seconds)...');
  
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    log.success('MongoDB connection established!');
    log.info(`Host: ${conn.connection.host}`);
    log.info(`Database: ${conn.connection.name}`);
    log.info(`Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
    
    // Try to list collections
    const collections = await conn.connection.db.listCollections().toArray();
    log.info(`Collections: ${collections.length}`);
    if (collections.length > 0) {
      log.info(`Collection Names: ${collections.map(c => c.name).join(', ')}`);
    }
    
    // Close connection
    await mongoose.disconnect();
    log.success('Connection test successful!');
    
  } catch (error) {
    log.error(`MongoDB Connection Failed: ${error.message}`);
    
    log.section('Troubleshooting Suggestions:');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      log.warning('DNS/Network Issue');
      log.info('  1. Check internet connection');
      log.info('  2. Verify hostname is correct');
      log.info('  3. Check firewall/VPN settings');
      log.info('  4. Try using a different DNS provider');
      
    } else if (error.message.includes('Authentication failed') || error.message.includes('auth')) {
      log.warning('Authentication Issue');
      log.info('  1. Verify username and password are correct');
      log.info('  2. Check MongoDB Atlas Database Access settings');
      log.info('  3. Ensure user has proper permissions');
      log.info('  4. Verify password special characters are URL-encoded');
      
    } else if (error.message.includes('IP')) {
      log.warning('IP Whitelist Issue');
      log.info('  1. Go to: https://cloud.mongodb.com → Network Access');
      log.info('  2. Add your current IP address to the whitelist');
      log.info('  3. Or allow 0.0.0.0/0 for all IPs (dev only)');
      
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
      log.warning('Connection Timeout');
      log.info('  1. Check if MongoDB Atlas cluster is running');
      log.info('  2. Verify cluster is not paused');
      log.info('  3. Check if your IP is whitelisted');
      log.info('  4. Verify firewall is not blocking port 27017');
      log.info('  5. Try resuming the cluster at MongoDB Atlas');
    }
    
    log.section('Full Error Details:');
    console.log(error);
  }
  
  // Step 7: Test application endpoints
  log.section('7. API Endpoint Check');
  log.info('To test API endpoints, start the backend:');
  log.info('  npm run dev');
  log.info('');
  log.info('Then test health check:');
  log.info('  curl http://localhost:5000/api/health');
  log.info('  curl http://localhost:5000/api/health/info');
  
  log.section('Diagnostic Complete');
  console.log('');
}

// Run diagnostics
runDiagnostics().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
