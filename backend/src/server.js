const app = require('./app');
const env = require('./config/env');
const cppBridge = require('./services/cppBridge');
const Contact = require('./models/Contact');

const connectDB = async () => {
  // Try to connect to MongoDB, if fails log and handle gracefully
  try {
    const connect = require('./config/db');
    await connect();
  } catch (error) {
    console.error('❌ Database connection failed at startup:', error.message);
  }
};

const preloadCppEngine = async () => {
  try {
    // Initialize bridge process
    cppBridge.init();

    // Fetch all active contacts (not soft-deleted)
    const contacts = await Contact.find({ isDeleted: false });

    // Format fields to match C++ Contact constructor properties
    const formatted = contacts.map(c => ({
      id: c._id.toString(),
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      alternativePhone: c.alternativePhone || '',
      email: c.email || '',
      company: c.company || '',
      designation: c.designation || '',
      department: c.department || '',
      category: c.category || 'personal',
      city: c.city || '',
      state: c.state || '',
      country: c.country || '',
      zipCode: c.zipCode || '',
      website: c.website || '',
      linkedin: c.linkedin || '',
      birthday: c.birthday ? c.birthday.toISOString().split('T')[0] : '',
      notes: c.notes || '',
      tags: c.tags || [],
      isFavorite: c.isFavorite,
      isBlocked: c.isBlocked,
      lastContacted: c.lastContacted ? c.lastContacted.toISOString() : '',
      contactCount: c.contactCount || 0,
      createdAt: c.createdAt.toISOString()
    }));

    const result = await cppBridge.sendCommand('load', formatted);
    console.log(`🧠 C++ Algorithm Engine pre-loaded with ${result.contactsCount} contacts`);
  } catch (error) {
    console.error('❌ Failed to preload C++ Algorithm Engine:', error.message);
  }
};

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Preload contacts into C++ Engine
  await preloadCppEngine();

  // Listen on PORT
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    console.error(`🔥 Unhandled Rejection Error: ${err.message}`);
    cppBridge.close();
    // Close server & exit process
    server.close(() => process.exit(1));
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (err) => {
    console.error(`🔥 Uncaught Exception Error: ${err.message}`);
    cppBridge.close();
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};

startServer();
