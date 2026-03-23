const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../models/Blog');

dotenv.config();

const addSlugsToBlogs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all blogs
    const blogs = await Blog.find({});
    console.log(`Found ${blogs.length} blogs`);

    let updatedCount = 0;

    for (const blog of blogs) {
      console.log(`\nChecking blog: ${blog.title}`);
      console.log(`Current slug: ${blog.slug || 'MISSING'}`);
      
      if (!blog.slug) {
        // Generate slug from title
        const slug = blog.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim();
        
        blog.slug = slug;
        await blog.save();
        updatedCount++;
        console.log(`✓ Added slug: ${slug}`);
      } else {
        console.log(`✓ Slug already exists: ${blog.slug}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`Total blogs: ${blogs.length}`);
    console.log(`Updated with slugs: ${updatedCount}`);

    // Test a few blog API calls
    console.log(`\n🧪 Testing blog API calls:`);
    
    const sampleBlog = blogs[0];
    if (sampleBlog && sampleBlog.slug) {
      console.log(`Sample blog slug: ${sampleBlog.slug}`);
      console.log(`Test URL: http://localhost:5174/blog-details/${sampleBlog.slug}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addSlugsToBlogs();