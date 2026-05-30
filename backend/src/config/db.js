const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      console.log('Seeding super admin user...');
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'Admin@123', // Hashing is handled by userSchema.pre('save')
        role: 'admin'
      });
      console.log('Super admin user seeded successfully!');
    }
  } catch (error) {
    console.error('Super admin seeding error:', error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed administrative user
    await seedAdmin();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
