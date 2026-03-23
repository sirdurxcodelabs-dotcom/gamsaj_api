const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../models/Blog');
const User = require('../models/User');

dotenv.config();

const createTestBlog = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a user to be the author
    const user = await User.findOne({ email: 'superadmin@gamsaj.com' });
    if (!user) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Create test blog
    const testBlog = await Blog.create({
      title: 'Welcome to GAMSAJ International Blog',
      excerpt: 'Welcome to the official blog of GAMSAJ International Limited. Here we share insights about construction, engineering, and business development in Nigeria.',
      content: `# Welcome to GAMSAJ International Blog

We are excited to launch our official blog where we will share:

## Construction Insights
- Latest construction techniques and technologies
- Project management best practices
- Safety protocols and standards

## Engineering Excellence
- Structural engineering innovations
- Sustainable building practices
- Quality assurance methodologies

## Business Development
- Industry trends and analysis
- Partnership opportunities
- Company updates and milestones

Stay tuned for regular updates and insights from our team of experts!`,
      category: 'Business',
      tags: ['welcome', 'construction', 'engineering', 'business'],
      status: 'published',
      featured: true,
      author: user._id,
      authorName: user.name,
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      },
      seo: {
        metaTitle: 'Welcome to GAMSAJ International Blog',
        metaDescription: 'Official blog of GAMSAJ International Limited - Construction, Engineering, and Business insights',
        metaKeywords: ['GAMSAJ', 'construction', 'engineering', 'Nigeria', 'blog'],
      },
    });

    console.log('✓ Test blog created successfully!');
    console.log(`Blog ID: ${testBlog._id}`);
    console.log(`Title: ${testBlog.title}`);
    console.log(`Status: ${testBlog.status}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test blog:', error);
    process.exit(1);
  }
};

createTestBlog();