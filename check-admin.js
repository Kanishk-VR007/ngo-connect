const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@ngoconnect.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('\n✓ Admin user found:');
    console.log('  Name:', admin.name);
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('  Active:', admin.isActive);
    console.log('  Password hash exists:', !!admin.password);
    console.log('  Password hash length:', admin.password?.length);

    // Test password comparison
    const testPassword = 'admin123';
    const isMatch = await admin.comparePassword(testPassword);
    console.log('\n✓ Password comparison test:');
    console.log('  Test password:', testPassword);
    console.log('  Match result:', isMatch);

    if (!isMatch) {
      console.log('\n❌ PASSWORD DOES NOT MATCH!');
      console.log('This means the password was not hashed correctly during seeding.');
    } else {
      console.log('\n✓ PASSWORD MATCHES CORRECTLY!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();
