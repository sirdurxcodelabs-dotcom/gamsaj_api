const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Simple blog schema without pre-save hooks
const simpleBlogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  excerpt: String,
  content: String,
  category: String,
  status: { type: String, default: 'draft' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  featuredImage: {
    url: String
  },
  tags: [String],
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  publishedAt: Date
}, { timestamps: true });

const SimpleBlog = mongoose.model('SimpleBlog', simpleBlogSchema);

const testSimpleBlog = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('../models/User');
    const user = await User.findOne({ email: 'superadmin@gamsaj.com' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const blog = await SimpleBlog.create({
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      excerpt: 'This is a test blog post',
      content: 'This is the content of the test blog post',
      category: 'Business',
      status: 'published',
      author: user._id,
      authorName: user.name,
      featuredImage: {
        url: 'https://via.placeholder.com/800x600'
      },
      tags: ['test'],
      featured: true,
      publishedAt: new Date()
    });

    console.log('✓ Simple blog created successfully!');
    console.log(`Blog ID: ${blog._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testSimpleBlog();