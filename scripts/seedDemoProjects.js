const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('../models/Project');
const User = require('../models/User');

dotenv.config();

const DEMO_PROJECTS = [
  {
    title: 'Abuja Federal Secretariat Complex',
    shortDescription: 'Construction of a 12-storey federal secretariat complex with modern office facilities and underground parking.',
    description: 'A landmark government infrastructure project involving the design and construction of a 12-storey federal secretariat complex in the heart of Abuja. The project includes modern office spaces, conference halls, underground parking for 400 vehicles, and full MEP installations.',
    category: 'construction',
    location: 'Abuja, FCT',
    clientName: 'Federal Ministry of Works',
    status: 'completed',
    priority: 'high',
    progressPercent: 100,
    startDate: new Date('2021-03-01'),
    endDate: new Date('2023-11-30'),
    isPublishedToWebsite: true,
    isFeatured: true,
    tags: ['government', 'high-rise', 'federal'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80' },
  },
  {
    title: 'Lagos–Ibadan Expressway Rehabilitation',
    shortDescription: 'Full rehabilitation and expansion of the 127km Lagos–Ibadan expressway including bridges and drainage.',
    description: 'Comprehensive rehabilitation of the 127km Lagos–Ibadan expressway corridor. Works include pavement reconstruction, bridge rehabilitation, drainage improvement, road markings, and installation of solar-powered street lighting along the entire route.',
    category: 'infrastructure',
    location: 'Lagos / Ogun State',
    clientName: 'Federal Roads Maintenance Agency',
    status: 'ongoing',
    priority: 'high',
    progressPercent: 68,
    startDate: new Date('2023-01-15'),
    expectedCompletionDate: new Date('2025-06-30'),
    isPublishedToWebsite: false,
    isFeatured: false,
    tags: ['road', 'expressway', 'federal'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80' },
  },
  {
    title: 'Kano Industrial Estate Phase 2',
    shortDescription: 'Development of 45 factory units and supporting infrastructure for the Kano Free Trade Zone.',
    description: 'Phase 2 development of the Kano Industrial Estate comprising 45 factory units ranging from 500sqm to 2,000sqm, internal road network, water treatment plant, 33KV power substation, and perimeter fencing across 120 hectares.',
    category: 'industrial',
    location: 'Kano, Kano State',
    clientName: 'Kano State Investment Promotion Agency',
    status: 'ongoing',
    priority: 'high',
    progressPercent: 45,
    startDate: new Date('2023-06-01'),
    expectedCompletionDate: new Date('2025-12-31'),
    isPublishedToWebsite: false,
    isFeatured: false,
    tags: ['industrial', 'factory', 'free-trade-zone'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80' },
  },
  {
    title: 'Gwarinpa Estate Luxury Residences',
    shortDescription: 'Development of 80 luxury 4-bedroom detached homes with smart home technology in Gwarinpa.',
    description: 'A premium residential development of 80 luxury 4-bedroom detached homes in the Gwarinpa district of Abuja. Each unit features smart home automation, solar power backup, BQ, swimming pool, and landscaped gardens. The estate includes a clubhouse, gym, and 24/7 security.',
    category: 'real-estate',
    location: 'Gwarinpa, Abuja',
    clientName: 'Gwarinpa Homes Ltd',
    status: 'completed',
    priority: 'medium',
    progressPercent: 100,
    startDate: new Date('2020-09-01'),
    endDate: new Date('2022-08-31'),
    isPublishedToWebsite: true,
    isFeatured: true,
    tags: ['residential', 'luxury', 'smart-home'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' },
  },
  {
    title: 'Suleja Water Treatment Plant',
    shortDescription: 'Construction of a 50,000m³/day water treatment plant serving Suleja and environs.',
    description: 'Design and construction of a 50,000 cubic metres per day water treatment plant including intake works, sedimentation tanks, filtration units, chlorination facility, pumping stations, and a 10km transmission main to the distribution network.',
    category: 'infrastructure',
    location: 'Suleja, Niger State',
    clientName: 'Niger State Water Board',
    status: 'completed',
    priority: 'high',
    progressPercent: 100,
    startDate: new Date('2019-04-01'),
    endDate: new Date('2021-10-15'),
    isPublishedToWebsite: true,
    isFeatured: false,
    tags: ['water', 'treatment', 'infrastructure'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80' },
  },
  {
    title: 'Minna Teaching Hospital Expansion',
    shortDescription: 'Construction of a new 200-bed wing, theatre complex, and diagnostic centre at Minna Teaching Hospital.',
    description: 'Expansion of the Minna Teaching Hospital with a new 200-bed inpatient wing, 4-theatre surgical complex, modern diagnostic and imaging centre, pharmacy, and staff accommodation block. The project includes full MEP, medical gas systems, and HVAC.',
    category: 'construction',
    location: 'Minna, Niger State',
    clientName: 'Niger State Ministry of Health',
    status: 'on-hold',
    priority: 'high',
    progressPercent: 32,
    startDate: new Date('2022-11-01'),
    expectedCompletionDate: new Date('2025-05-31'),
    isPublishedToWebsite: false,
    isFeatured: false,
    tags: ['hospital', 'healthcare', 'government'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80' },
  },
  {
    title: 'Abuja Ring Road Section 4',
    shortDescription: 'Construction of 18km dual carriageway ring road section with 3 interchanges and 2 flyovers.',
    description: 'Construction of Section 4 of the Abuja Ring Road comprising 18km of dual carriageway, 3 grade-separated interchanges, 2 flyover bridges, pedestrian walkways, storm drainage, and street lighting. The project also includes landscaping and road furniture.',
    category: 'infrastructure',
    location: 'Abuja, FCT',
    clientName: 'FCT Administration',
    status: 'planned',
    priority: 'medium',
    progressPercent: 0,
    startDate: new Date('2025-01-01'),
    expectedCompletionDate: new Date('2027-06-30'),
    isPublishedToWebsite: false,
    isFeatured: false,
    tags: ['road', 'ring-road', 'FCT'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  },
  {
    title: 'Kaduna Steel Rolling Mill Upgrade',
    shortDescription: 'Upgrade and modernisation of the Kaduna Steel Rolling Mill production line to 500,000 tonnes/year capacity.',
    description: 'Comprehensive upgrade of the Kaduna Steel Rolling Mill including installation of a new electric arc furnace, continuous casting machine, rolling mill line, and auxiliary systems. The project increases annual production capacity from 150,000 to 500,000 tonnes of steel products.',
    category: 'industrial',
    location: 'Kaduna, Kaduna State',
    clientName: 'Delta Steel Company',
    status: 'ongoing',
    priority: 'high',
    progressPercent: 55,
    startDate: new Date('2023-03-01'),
    expectedCompletionDate: new Date('2025-09-30'),
    isPublishedToWebsite: false,
    isFeatured: false,
    tags: ['steel', 'industrial', 'manufacturing'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80' },
  },
  {
    title: 'Port Harcourt Mixed-Use Tower',
    shortDescription: 'A 22-storey mixed-use tower with retail, office, and serviced apartments in Port Harcourt GRA.',
    description: 'Design and construction of a 22-storey mixed-use development in Port Harcourt GRA Phase 2. The tower comprises 4 floors of retail and commercial space, 10 floors of Grade-A office space, and 8 floors of fully serviced apartments. Includes basement parking for 300 vehicles.',
    category: 'real-estate',
    location: 'Port Harcourt, Rivers State',
    clientName: 'PH Towers Development Ltd',
    status: 'ongoing',
    priority: 'medium',
    progressPercent: 22,
    startDate: new Date('2024-02-01'),
    expectedCompletionDate: new Date('2027-01-31'),
    isPublishedToWebsite: false,
    isFeatured: false,
    tags: ['high-rise', 'mixed-use', 'commercial'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80' },
  },
  {
    title: 'Ibadan Solar Power Substation',
    shortDescription: 'Construction of a 132/33KV substation and 5MW solar hybrid power plant for the Ibadan industrial cluster.',
    description: 'Engineering, procurement, and construction of a 132/33KV grid substation and 5MW solar hybrid power plant to provide reliable power to the Ibadan industrial cluster. Works include civil foundations, transformer installation, switchgear, control building, and 5km 33KV feeder lines.',
    category: 'industrial',
    location: 'Ibadan, Oyo State',
    clientName: 'Ibadan Electricity Distribution Company',
    status: 'completed',
    priority: 'high',
    progressPercent: 100,
    startDate: new Date('2021-07-01'),
    endDate: new Date('2023-04-30'),
    isPublishedToWebsite: true,
    isFeatured: false,
    tags: ['power', 'solar', 'substation'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80' },
  },
];

const seedDemoProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Find any admin user to set as createdBy
    const adminUser = await User.findOne({ isActive: true });
    if (!adminUser) throw new Error('No active user found. Run seedSuperAdmin first.');

    // Remove existing demo projects (by tag)
    await Project.deleteMany({ tags: 'demo-data' });
    console.log('🗑️  Cleared existing demo projects');

    const projects = DEMO_PROJECTS.map(p => ({
      ...p,
      tags: [...(p.tags || []), 'demo-data'],
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    }));

    const created = await Project.insertMany(projects);
    console.log(`✅ Seeded ${created.length} demo projects`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seedDemoProjects();
