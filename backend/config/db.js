const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/angulardemo';
  try {
    await mongoose.connect(uri);
    
    // Auto-seed catalog if empty
    const Catalog = require('../models/catalog.model');
    const count = await Catalog.countDocuments();
    if (count === 0) {
      const fs = require('fs');
      const path = require('path');
      const rawData = fs.readFileSync(path.join(__dirname, '../data.json'), 'utf8');
      const seedData = JSON.parse(rawData);
      try {
        await Catalog.insertMany(seedData);
      } catch (err) {
        const isDuplicateKeyError = err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000) || (err.writeErrors && err.writeErrors.some(e => e.code === 11000));
        if (isDuplicateKeyError) {
          console.log('Ignored duplicate key error during database seeding:', err.message);
        } else {
          throw err;
        }
      }
    }

    // Auto-seed initial admin user account
    const userController = require('../controllers/user.controller');
    await userController.seedAdminUser();
  } catch (error) {
    console.error('Database connection / seeding failed:', error);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Database disconnection failed:', error);
  }
};

module.exports = { connectDB, disconnectDB };
