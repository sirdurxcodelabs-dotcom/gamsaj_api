const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Role = require('../models/Role');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');

dotenv.config();

const testBlogAPIWithAuth = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check blogs in database
    const allBlogs = await Blog.find({});
    console.log(`📊 Total blogs in database: ${allBlogs.length}`);
    
    allBlogs.forEach(blog => {
      console.log(`  - ${blog.title} (${blog.status})`);
    });

    // Find Super Admin user
    const user = await User.findOne({ email: 'superadmin@gamsaj.com' }).populate('roleId');
    if (!user) {
      console.log('❌ Super Admin user not found');
      process.exit(1);
    }

    console.log(`\n✓ Found user: ${user.name} (${user.email})`);
    console.log(`✓ Role: ${user.roleId.name} (${user.roleId.slug})`);
    console.log(`✓ Permissions count: ${user.roleId.permissions.length}`);

    // Check if user has blog permissions
    const blogPermissions = user.roleId.permissions.filter(p => p.includes('blog'));
    console.log(`✓ Blog permissions: ${blogPermissions.join(', ')}`);

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

    console.log('\n🔑 Generated JWT token');

    // Test the blog controller logic manually
    console.log('\n🧪 Testing blog controller logic:');
    
    // Simulate authenticated request with status=all
    const mockReq = {
      user: { id: user._id, email: user.email },
      query: { status: 'all', limit: 100 }
    };

    const query = {};
    const { status } = mockReq.query;

    if (status && status !== 'all') {
      query.status = status;
    } else if (!mockReq.user) {
      query.status = 'published';
    }

    console.log('Query object:', query);
    console.log('Should return all blogs since user is authenticated and status=all');

    const blogs = await Blog.find(query).limit(100);
    console.log(`✓ Query result: ${blogs.length} blogs found`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testBlogAPIWithAuth();