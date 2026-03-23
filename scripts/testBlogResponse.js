const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../models/Blog');

dotenv.config();

const testBlogResponse = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test the same query as the controller
    const blogs = await Blog.find({ status: 'published' })
      .sort('-publishedAt')
      .limit(3)
      .select('-content');

    console.log(`Found ${blogs.length} published blogs`);
    
    blogs.forEach((blog, index) => {
      console.log(`\n${index + 1}. ${blog.title}`);
      console.log(`   Slug: ${blog.slug || 'MISSING'}`);
      console.log(`   Status: ${blog.status}`);
      console.log(`   Author: ${blog.authorName}`);
      console.log(`   Category: ${blog.category}`);
      console.log(`   Featured Image: ${blog.featuredImage?.url ? 'Present' : 'Missing'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testBlogResponse();