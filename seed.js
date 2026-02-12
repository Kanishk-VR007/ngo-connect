const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('./backend/models/User');
const NGO = require('./backend/models/NGO');
const ServiceRequest = require('./backend/models/ServiceRequest');
const Donation = require('./backend/models/Donation');

// Sample NGO locations across major cities
const sampleNGOs = [
  {
    name: "Hope Foundation",
    email: "contact@hopefoundation.org",
    registrationNumber: "NGO-2010-001",
    description: "Empowering communities through education and healthcare services. We focus on providing quality education to underprivileged children and healthcare to remote areas.",
    phone: "+1-555-0101",
    location: {
      type: "Point",
      coordinates: [-74.0060, 40.7128], // New York
      address: "123 Charity Street",
      city: "New York",
      state: "NY",
      country: "USA",
      pincode: "10001"
    },
    website: "https://hopefoundation.org",
    serviceCategories: ["Education", "Healthcare"],
    foundedYear: 2010,
    teamSize: 45,
    isActive: true,
    isVerified: true,
    members: [],
    statistics: {
      projectsCompleted: 150,
      peopleHelped: 25000,
      volunteersCount: 450
    },
    rating: {
      average: 4.8,
      count: 120
    }
  },
  {
    name: "Green Earth Foundation",
    email: "info@greenearth.org",
    registrationNumber: "NGO-2014-002",
    description: "Dedicated to environmental conservation and sustainable development. Working towards a greener planet through tree plantation drives and waste management.",
    phone: "+1-555-0102",
    location: {
      type: "Point",
      coordinates: [-118.2437, 34.0522], // Los Angeles
      address: "456 Eco Avenue",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      pincode: "90001"
    },
    website: "https://greenearth.org",
    serviceCategories: ["Environmental"],
    foundedYear: 2014,
    teamSize: 32,
    isActive: true,
    isVerified: true,
    members: [],
    statistics: {
      projectsCompleted: 89,
      peopleHelped: 15000,
      volunteersCount: 320
    },
    rating: {
      average: 4.6,
      count: 85
    }
  },
  {
    name: "Health First NGO",
    email: "support@healthfirst.org",
    registrationNumber: "NGO-2006-003",
    description: "Providing accessible healthcare services to underserved communities. Free medical camps, health awareness programs, and emergency medical assistance.",
    phone: "+1-555-0103",
    location: {
      type: "Point",
      coordinates: [-87.6298, 41.8781], // Chicago
      address: "789 Medical Plaza",
      city: "Chicago",
      state: "IL",
      country: "USA",
      pincode: "60601"
    },
    website: "https://healthfirst.org",
    serviceCategories: ["Healthcare"],
    foundedYear: 2006,
    teamSize: 60,
    isActive: true,
    isVerified: true,
    members: [],
    statistics: {
      projectsCompleted: 250,
      peopleHelped: 50000,
      volunteersCount: 600
    },
    rating: {
      average: 4.9,
      count: 200
    }
  },
  {
    name: "Education For All",
    email: "contact@educationforall.org",
    registrationNumber: "NGO-2012-004",
    description: "Breaking barriers to quality education. Providing scholarships, learning materials, and mentorship to students from low-income families.",
    phone: "+1-555-0104",
    location: {
      type: "Point",
      coordinates: [-95.3698, 29.7604], // Houston
      address: "321 Learning Lane",
      city: "Houston",
      state: "TX",
      country: "USA",
      pincode: "77001"
    },
    website: "https://educationforall.org",
    serviceCategories: ["Education", "Skill Development"],
    foundedYear: 2012,
    teamSize: 28,
    isActive: true,
    isVerified: true,
    members: [],
    statistics: {
      projectsCompleted: 180,
      peopleHelped: 30000,
      volunteersCount: 280
    },
    rating: {
      average: 4.7,
      count: 150
    }
  },
  {
    name: "Food Relief Network",
    email: "help@foodrelief.org",
    registrationNumber: "NGO-2016-005",
    description: "Fighting hunger and malnutrition in our communities. Daily meal distribution, nutrition education, and food security programs.",
    phone: "+1-555-0105",
    location: {
      type: "Point",
      coordinates: [-112.0740, 33.4484], // Phoenix
      address: "654 Hunger Street",
      city: "Phoenix",
      state: "AZ",
      country: "USA",
      pincode: "85001"
    },
    website: "https://foodrelief.org",
    serviceCategories: ["Food & Nutrition"],
    foundedYear: 2016,
    teamSize: 50,
    isActive: true,
    isVerified: true,
    members: [],
    statistics: {
      projectsCompleted: 120,
      peopleHelped: 40000,
      volunteersCount: 500
    },
    rating: {
      average: 4.8,
      count: 175
    }
  },
  {
    name: "Women Empowerment Center",
    email: "info@womenempowerment.org",
    registrationNumber: "NGO-2015-006",
    description: "Empowering women through skill development, entrepreneurship training, and advocacy. Creating opportunities for economic independence.",
    phone: "+1-555-0106",
    location: {
      type: "Point",
      coordinates: [-75.1652, 39.9526], // Philadelphia
      address: "987 Equality Road",
      city: "Philadelphia",
      state: "PA",
      country: "USA",
      pincode: "19101"
    },
    website: "https://womenempowerment.org",
    serviceCategories: ["Women Empowerment", "Skill Development"],
    foundedYear: 2015,
    teamSize: 18,
    isActive: true,
    isVerified: true,
    members: [],
    statistics: {
      projectsCompleted: 95,
      peopleHelped: 12000,
      volunteersCount: 180
    },
    rating: {
      average: 4.9,
      count: 95
    }
  },
  {
    name: "Child Care Foundation",
    email: "support@childcare.org",
    registrationNumber: "NGO-2008-007",
    description: "Protecting and nurturing children's rights and well-being. Providing shelter, education, and healthcare to orphaned and vulnerable children.",
    phone: "+1-555-0107",
    location: {
      type: "Point",
      coordinates: [-98.4936, 29.4241], // San Antonio
      address: "147 Kids Avenue",
      city: "San Antonio",
      state: "TX",
      country: "USA",
      pincode: "78201"
    },
    website: "https://childcare.org",
    serviceCategories: ["Child Welfare", "Education", "Healthcare"],
    foundedYear: 2008,
    teamSize: 35,
    isActive: true,
    isVerified: true,
    members: [],
    statistics: {
      projectsCompleted: 200,
      peopleHelped: 8000,
      volunteersCount: 350
    },
    rating: {
      average: 4.8,
      count: 165
    }
  },
  {
    name: "Disaster Relief Corps",
    email: "emergency@disasterrelief.org",
    registrationNumber: "NGO-2010-008",
    description: "Rapid response to natural disasters and emergencies. Providing immediate relief, rehabilitation, and reconstruction support to affected communities.",
    phone: "+1-555-0108",
    location: {
      type: "Point",
      coordinates: [-117.1611, 32.7157], // San Diego
      address: "258 Response Street",
      city: "San Diego",
      state: "CA",
      country: "USA",
      pincode: "92101"
    },
    website: "https://disasterrelief.org",
    serviceCategories: ["Disaster Relief", "Healthcare", "Shelter"],
    foundedYear: 2010,
    teamSize: 80,
    isActive: true,
    isVerified: true,
    members: [],
    statistics: {
      projectsCompleted: 175,
      peopleHelped: 60000,
      volunteersCount: 800
    },
    rating: {
      average: 4.9,
      count: 220
    }
  }
];

// Sample users
const sampleUsers = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    role: "user",
    phone: "+1-555-1001",
    location: {
      type: "Point",
      coordinates: [-74.0060, 40.7128] // New York
    },
    address: "10 User Street, New York, NY",
    isActive: true
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "password123",
    role: "user",
    phone: "+1-555-1002",
    location: {
      type: "Point",
      coordinates: [-118.2437, 34.0522] // Los Angeles
    },
    address: "20 Helper Avenue, Los Angeles, CA",
    isActive: true
  },
  {
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    password: "password123",
    role: "user",
    phone: "+1-555-1003",
    location: {
      type: "Point",
      coordinates: [-87.6298, 41.8781] // Chicago
    },
    address: "30 Community Road, Chicago, IL",
    isActive: true
  }
];

// Admin user
const adminUser = {
  name: "Admin User",
  email: "admin@ngoconnect.com",
  password: "admin123",
  role: "admin",
  phone: "+1-555-9999",
  isActive: true
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('\nClearing existing data...');
    await User.deleteMany({});
    await NGO.deleteMany({});
    await ServiceRequest.deleteMany({});
    await Donation.deleteMany({});
    console.log('✓ Existing data cleared');

    // Create admin user
    console.log('\nCreating admin user...');
    const admin = await User.create(adminUser);
    console.log(`✓ Admin created: ${admin.email} (password: admin123)`);

    // Create sample users
    console.log('\nCreating sample users...');
    const users = [];
    for (let userData of sampleUsers) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`✓ User created: ${user.email} (password: password123)`);
    }

    // Create NGOs
    console.log('\nCreating NGOs...');
    const ngos = [];
    for (let ngoData of sampleNGOs) {
      const ngo = await NGO.create(ngoData);
      ngos.push(ngo);
      console.log(`✓ NGO created: ${ngo.name} at [${ngo.location.coordinates}]`);
    }

    // Create sample service requests
    console.log('\nCreating sample service requests...');
    const requestStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    const serviceCategories = ['Education', 'Healthcare', 'Food & Nutrition', 'Shelter', 'Skill Development'];
    
    for (let i = 0; i < 12; i++) {
      const user = users[i % users.length];
      const ngo = ngos[i % ngos.length];
      const status = requestStatuses[i % requestStatuses.length];
      const category = serviceCategories[i % serviceCategories.length];
      
      const request = await ServiceRequest.create({
        title: `${category} Assistance Request #${i + 1}`,
        requestedBy: user._id,
        ngoId: ngo._id,
        serviceCategory: category,
        description: `I need help with ${category.toLowerCase()}. This is sample request ${i + 1} for testing purposes.`,
        urgency: ['low', 'medium', 'high'][i % 3],
        status: status,
        location: user.location,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        ...(status === 'completed' && {
          feedback: {
            rating: 4 + Math.random(),
            comment: "Great service! Very helpful and professional."
          }
        })
      });
      console.log(`✓ Service request created: ${request.title} - ${request.status}`);
    }

    // Create sample donations
    console.log('\nCreating sample donations...');
    for (let i = 0; i < 20; i++) {
      const user = users[i % users.length];
      const ngo = ngos[i % ngos.length];
      
      const donation = await Donation.create({
        donorId: user._id,
        ngoId: ngo._id,
        amount: Math.floor(Math.random() * 900) + 100,
        currency: 'USD',
        paymentMethod: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'][i % 5],
        status: 'completed',
        message: `Supporting ${ngo.name}'s great work!`,
        isAnonymous: i % 4 === 0,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      });
      console.log(`✓ Donation created: $${donation.amount} to ${ngo.name}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✓ DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\nSummary:');
    console.log(`- Admin Users: 1`);
    console.log(`- Regular Users: ${users.length}`);
    console.log(`- NGOs: ${ngos.length}`);
    console.log(`- Service Requests: 15`);
    console.log(`- Donations: 20`);
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@ngoconnect.com / admin123');
    console.log('User: john.doe@example.com / password123');
    console.log('User: jane.smith@example.com / password123');
    console.log('User: mike.johnson@example.com / password123');
    console.log('\n' + '='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
