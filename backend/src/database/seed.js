const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Contact = require('../models/Contact');
const ActivityLog = require('../models/ActivityLog');

const mockContacts = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1-555-0101',
    email: 'sarah.j@techcorp.com',
    company: 'TechCorp',
    designation: 'Senior Product Manager',
    department: 'Product',
    category: 'work',
    city: 'San Francisco',
    state: 'California',
    country: 'USA',
    isFavorite: true,
    tags: ['tech', 'manager', 'partner']
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    phone: '+1-555-0102',
    email: 'michael.chen@datainc.com',
    company: 'DataInc',
    designation: 'Data Scientist',
    department: 'Engineering',
    category: 'work',
    city: 'New York',
    state: 'New York',
    country: 'USA',
    isFavorite: false,
    tags: ['data', 'python']
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    phone: '+1-555-0103',
    email: 'emily.davis@gmail.com',
    company: '',
    designation: '',
    department: '',
    category: 'friend',
    city: 'Seattle',
    state: 'Washington',
    country: 'USA',
    isFavorite: true,
    tags: ['college', 'hiking']
  },
  {
    firstName: 'Robert',
    lastName: 'Wilson',
    phone: '+1-555-0104',
    email: 'robert.w@startupx.io',
    company: 'StartupX',
    designation: 'CTO',
    department: 'Leadership',
    category: 'work',
    city: 'Austin',
    state: 'Texas',
    country: 'USA',
    isFavorite: false,
    tags: ['executive', 'investor']
  },
  {
    firstName: 'Lisa',
    lastName: 'Anderson',
    phone: '+1-555-0105',
    email: 'lisa.anderson@family.com',
    company: '',
    designation: '',
    department: '',
    category: 'family',
    city: 'Chicago',
    state: 'Illinois',
    country: 'USA',
    isFavorite: false,
    tags: ['cousin', 'birthday-notified']
  },
  {
    firstName: 'James',
    lastName: 'Taylor',
    phone: '+1-555-0106',
    email: 'james@webco.dev',
    company: 'WebCo',
    designation: 'Frontend Lead',
    department: 'Engineering',
    category: 'work',
    city: 'San Francisco',
    state: 'California',
    country: 'USA',
    isFavorite: true,
    tags: ['developer', 'react']
  },
  {
    firstName: 'Sophia',
    lastName: 'Martinez',
    phone: '+1-555-0107',
    email: 'sophia.m@designs.com',
    company: 'PixelDesigns',
    designation: 'UI/UX Director',
    department: 'Design',
    category: 'work',
    city: 'Los Angeles',
    state: 'California',
    country: 'USA',
    isFavorite: false,
    tags: ['designer', 'creative']
  },
  {
    firstName: 'David',
    lastName: 'Thomas',
    phone: '+1-555-0108',
    email: 'david.thomas@gmail.com',
    company: '',
    designation: '',
    department: '',
    category: 'personal',
    city: 'Boston',
    state: 'Massachusetts',
    country: 'USA',
    isFavorite: false,
    tags: ['neighbor']
  },
  {
    firstName: 'Emma',
    lastName: 'White',
    phone: '+1-555-0109',
    email: 'emma.white@healthorg.org',
    company: 'HealthOrg',
    designation: 'Medical Advisor',
    department: 'Consulting',
    category: 'other',
    city: 'Denver',
    state: 'Colorado',
    country: 'USA',
    isFavorite: false,
    tags: ['medical', 'consultant']
  },
  {
    firstName: 'Daniel',
    lastName: 'Harris',
    phone: '+1-555-0110',
    email: 'daniel.h@family.com',
    company: '',
    designation: '',
    department: '',
    category: 'family',
    city: 'Seattle',
    state: 'Washington',
    country: 'USA',
    isFavorite: true,
    tags: ['uncle']
  }
];

// Generate additional mock contacts programmatically to get a total of ~45 contacts
const names = [
  { first: 'William', last: 'Clark' }, { first: 'Olivia', last: 'Rodriguez' },
  { first: 'Joseph', last: 'Lewis' }, { first: 'Ava', last: 'Lee' },
  { first: 'Charles', test: 'Walker' }, { first: 'Mia', last: 'Hall' },
  { first: 'Thomas', last: 'Allen' }, { first: 'Isabella', last: 'Young' },
  { first: 'Matthew', last: 'King' }, { first: 'Sophia', last: 'Wright' },
  { first: 'Andrew', last: 'Hill' }, { first: 'Harper', last: 'Scott' },
  { first: 'Joshua', last: 'Green' }, { first: 'Evelyn', last: 'Adams' },
  { first: 'Kevin', last: 'Baker' }, { first: 'Abigail', last: 'Gonzalez' }
];

const cities = [
  { city: 'San Francisco', state: 'California' },
  { city: 'New York', state: 'New York' },
  { city: 'Chicago', state: 'Illinois' },
  { city: 'Seattle', state: 'Washington' },
  { city: 'Austin', state: 'Texas' }
];

const companies = ['TechCorp', 'DataInc', 'WebCo', 'StartupX', 'PixelDesigns', 'BigCloud', 'FintechLab'];
const categories = ['work', 'personal', 'family', 'friend', 'other'];

const seedDatabase = async () => {
  try {
    console.log('📡 Connecting to database for seeding...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('📡 Connection active.');

    // Clear existing data
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Contact.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('🧹 Collections cleared.');

    // Create Admin User
    console.log('👤 Creating admin and verified guest users...');
    const guestUser = await User.create({
      firstName: 'Guest',
      lastName: 'User',
      email: 'user@example.com',
      password: 'SecureP@ss123', // Will be hashed via pre-save hook
      isVerified: true,
      role: 'user'
    });

    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@example.com',
      password: 'AdminSecure123',
      isVerified: true,
      role: 'admin'
    });
    console.log('👤 Users created successfully.');

    // Seed Core Contacts for Guest User
    console.log('👥 Seeding core contacts for guest user...');
    const contactsData = mockContacts.map(c => ({
      ...c,
      userId: guestUser._id,
      contactCount: Math.floor(Math.random() * 20),
      lastContacted: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
    }));

    // Generate programmatic mock data
    for (let i = 0; i < 35; i++) {
      const name = names[i % names.length];
      const cityDetails = cities[i % cities.length];
      const category = categories[i % categories.length];
      const hasCompany = category === 'work' || Math.random() > 0.5;
      
      contactsData.push({
        userId: guestUser._id,
        firstName: name.first,
        lastName: name.last || 'Smith',
        phone: `+1-555-02${i.toString().padStart(2, '0')}`,
        email: `${name.first.toLowerCase()}.${(name.last || 'smith').toLowerCase()}@example.com`,
        company: hasCompany ? companies[i % companies.length] : '',
        designation: hasCompany ? 'Engineer' : '',
        department: hasCompany ? 'Engineering' : '',
        category,
        city: cityDetails.city,
        state: cityDetails.state,
        country: 'USA',
        isFavorite: Math.random() > 0.8,
        tags: [category, 'imported'],
        contactCount: Math.floor(Math.random() * 15),
        lastContacted: new Date(Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000)
      });
    }

    const insertedContacts = await Contact.insertMany(contactsData);
    console.log(`👥 Seeding completed. Added ${insertedContacts.length} contacts.`);

    // Create Initial Activity Logs
    console.log('📝 Generating activity logs...');
    await ActivityLog.create([
      {
        userId: guestUser._id,
        action: 'login',
        metadata: { ip: '127.0.0.1', device: 'Chrome / Windows' }
      },
      {
        userId: guestUser._id,
        action: 'import',
        metadata: { count: insertedContacts.length }
      }
    ]);
    console.log('📝 Activity logs created.');

    console.log('🟢 Seeding execution completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
