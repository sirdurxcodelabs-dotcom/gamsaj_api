const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

dotenv.config();

const testAuthenticatedBlogAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Super Admin user
    const user = await User.findOne({ email: 'superadmin@gamsaj.com' }).populate('roleId');
    if (!user) {
      console.log('❌ Super Admin user not found');
      process.exit(1);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        name: user.name,
        roleId: user.roleId._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✓ Generated JWT token for Super Admin');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Test the token format that frontend uses
    const authCookie = {
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roleId: user.roleId._id
      }
    };

    console.log('\n📋 Auth cookie format:');
    console.log(JSON.stringify(authCookie, null, 2));

    console.log('\n🔗 Test this in browser console:');
    console.log(`document.cookie = "_TECHMIN_AUTH_KEY_=${encodeURIComponent(JSON.stringify(authCookie))}; path=/";`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAuthenticatedBlogAPI();