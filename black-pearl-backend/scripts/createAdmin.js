const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get the User model
    const User = require('../models/User');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@blackpearl.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update password and role to be sure
      existingAdmin.password = 'admin123';
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin user updated with new password and role');
    } else {
      // Create admin user directly using the model to ensure proper hashing
      const adminUser = new User({
        name: 'Admin',
        surname: 'User',
        email: 'admin@blackpearl.com',
        phone: '000-000-0000',
        password: 'admin123', // This will be hashed by the pre-save hook
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully:', adminUser.email);
      console.log('Role:', adminUser.role);
    }
    
    // Verify the admin user
    const verifiedAdmin = await User.findOne({ email: 'admin@blackpearl.com' });
    console.log('Verified admin:', {
      email: verifiedAdmin.email,
      role: verifiedAdmin.role,
      name: verifiedAdmin.name
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();