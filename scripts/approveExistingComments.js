const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../models/Blog');

dotenv.config();

const approveExistingComments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all blogs with comments
    const blogs = await Blog.find({ 'comments.0': { $exists: true } });
    console.log(`Found ${blogs.length} blogs with comments`);

    let updatedCount = 0;

    for (const blog of blogs) {
      let hasUpdates = false;
      
      blog.comments.forEach(comment => {
        if (comment.isApproved === false || comment.isApproved === undefined) {
          comment.isApproved = true;
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        await blog.save();
        updatedCount++;
        console.log(`✓ Updated comments in blog: ${blog.title}`);
      }
    }

    console.log(`\n✅ Approved comments in ${updatedCount} blogs`);
    
    // Verify the changes
    const totalComments = await Blog.aggregate([
      { $unwind: '$comments' },
      { $group: { _id: null, total: { $sum: 1 }, approved: { $sum: { $cond: ['$comments.isApproved', 1, 0] } } } }
    ]);

    if (totalComments.length > 0) {
      console.log(`Total comments: ${totalComments[0].total}`);
      console.log(`Approved comments: ${totalComments[0].approved}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error approving comments:', error);
    process.exit(1);
  }
};

approveExistingComments();