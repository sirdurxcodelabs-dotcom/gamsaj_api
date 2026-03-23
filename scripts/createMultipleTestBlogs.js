const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../models/Blog');
const User = require('../models/User');

dotenv.config();

const createMultipleTestBlogs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the Super Admin user
    const user = await User.findOne({ email: 'superadmin@gamsaj.com' });
    if (!user) {
      console.log('❌ Super Admin user not found');
      process.exit(1);
    }

    // Check existing blogs
    const existingBlogs = await Blog.find({});
    console.log(`Found ${existingBlogs.length} existing blogs`);

    const testBlogs = [
      {
        title: 'Modern Construction Techniques in Nigeria',
        excerpt: 'Exploring the latest construction methodologies and technologies being adopted across Nigeria\'s building industry.',
        content: `# Modern Construction Techniques in Nigeria

Nigeria's construction industry is rapidly evolving with the adoption of modern techniques and technologies. At GAMSAJ International Limited, we are at the forefront of this transformation.

## Key Innovations

### 1. Prefabricated Construction
- Faster project completion
- Better quality control
- Reduced waste

### 2. Green Building Technologies
- Solar energy integration
- Rainwater harvesting systems
- Energy-efficient materials

### 3. Digital Project Management
- BIM (Building Information Modeling)
- Real-time project tracking
- Digital collaboration tools

## GAMSAJ's Approach

We combine traditional craftsmanship with cutting-edge technology to deliver exceptional results for our clients across Nigeria.`,
        category: 'Construction',
        tags: ['construction', 'technology', 'Nigeria', 'innovation'],
        status: 'published',
        featured: true,
        author: user._id,
        authorName: user.name,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
        },
        seo: {
          metaTitle: 'Modern Construction Techniques in Nigeria | GAMSAJ',
          metaDescription: 'Discover the latest construction techniques and technologies being used in Nigeria by GAMSAJ International Limited.',
          metaKeywords: ['construction', 'Nigeria', 'modern techniques', 'GAMSAJ'],
        },
      },
      {
        title: 'Sustainable Architecture for African Climate',
        excerpt: 'How sustainable architectural design principles can be adapted for the unique challenges of African climate conditions.',
        content: `# Sustainable Architecture for African Climate

Designing buildings that work harmoniously with Africa's diverse climate conditions requires specialized knowledge and innovative approaches.

## Climate Considerations

### Hot and Humid Regions
- Natural ventilation strategies
- Thermal mass optimization
- Shading solutions

### Arid Regions
- Water conservation systems
- Heat reflection techniques
- Passive cooling methods

## GAMSAJ's Sustainable Solutions

Our architectural team specializes in creating buildings that are both environmentally responsible and culturally appropriate for African contexts.`,
        category: 'Architecture',
        tags: ['architecture', 'sustainability', 'Africa', 'climate'],
        status: 'published',
        featured: false,
        author: user._id,
        authorName: user.name,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
        },
        seo: {
          metaTitle: 'Sustainable Architecture for African Climate | GAMSAJ',
          metaDescription: 'Learn about sustainable architectural design principles adapted for African climate conditions.',
          metaKeywords: ['architecture', 'sustainability', 'Africa', 'climate design'],
        },
      },
      {
        title: 'Project Management Excellence in Construction',
        excerpt: 'Best practices for managing large-scale construction projects from planning to completion.',
        content: `# Project Management Excellence in Construction

Successful construction projects require meticulous planning, effective communication, and adaptive management strategies.

## Key Success Factors

### 1. Comprehensive Planning
- Detailed project timelines
- Resource allocation
- Risk assessment

### 2. Stakeholder Communication
- Regular progress updates
- Clear documentation
- Conflict resolution

### 3. Quality Assurance
- Regular inspections
- Material testing
- Compliance monitoring

## GAMSAJ's Project Management Approach

With years of experience managing complex projects across Nigeria, we have developed proven methodologies that ensure project success.`,
        category: 'Project Management',
        tags: ['project management', 'construction', 'planning', 'quality'],
        status: 'draft',
        featured: false,
        author: user._id,
        authorName: user.name,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
        },
        seo: {
          metaTitle: 'Construction Project Management Excellence | GAMSAJ',
          metaDescription: 'Best practices for managing large-scale construction projects effectively.',
          metaKeywords: ['project management', 'construction', 'planning', 'GAMSAJ'],
        },
      },
      {
        title: 'Legal Compliance in Nigerian Construction',
        excerpt: 'Understanding the regulatory landscape and ensuring full compliance in Nigerian construction projects.',
        content: `# Legal Compliance in Nigerian Construction

Navigating the complex regulatory environment in Nigeria requires deep understanding of local laws and building codes.

## Key Compliance Areas

### Building Permits
- Federal requirements
- State regulations
- Local government approvals

### Safety Standards
- Occupational health and safety
- Environmental regulations
- Fire safety codes

### Professional Certifications
- COREN registration
- Professional indemnity
- Continuing education requirements

## GAMSAJ's Compliance Framework

Our legal and compliance team ensures all projects meet or exceed regulatory requirements while maintaining project timelines.`,
        category: 'Legal',
        tags: ['legal', 'compliance', 'Nigeria', 'regulations'],
        status: 'published',
        featured: false,
        author: user._id,
        authorName: user.name,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop',
        },
        seo: {
          metaTitle: 'Legal Compliance in Nigerian Construction | GAMSAJ',
          metaDescription: 'Understanding regulatory requirements for construction projects in Nigeria.',
          metaKeywords: ['legal compliance', 'Nigeria construction', 'regulations', 'GAMSAJ'],
        },
      }
    ];

    // Create blogs only if they don't exist
    for (const blogData of testBlogs) {
      const existingBlog = await Blog.findOne({ title: blogData.title });
      if (!existingBlog) {
        const blog = await Blog.create(blogData);
        console.log(`✓ Created blog: ${blog.title} (${blog.status})`);
      } else {
        console.log(`- Blog already exists: ${blogData.title}`);
      }
    }

    // Count total blogs
    const totalBlogs = await Blog.countDocuments();
    console.log(`\n📊 Total blogs in database: ${totalBlogs}`);

    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    const draftBlogs = await Blog.countDocuments({ status: 'draft' });
    
    console.log(`   - Published: ${publishedBlogs}`);
    console.log(`   - Draft: ${draftBlogs}`);

    console.log('\n✅ Test blogs creation completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test blogs:', error);
    process.exit(1);
  }
};

createMultipleTestBlogs();