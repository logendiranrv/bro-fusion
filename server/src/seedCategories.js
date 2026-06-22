const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

const categories = [
  { name: 'Shirt', slug: 'shirt', description: 'Premium casual and formal shirts' },
  { name: 'T-Shirt', slug: 't-shirt', description: 'Comfortable and stylish t-shirts' },
  { name: 'Pant', slug: 'pant', description: 'Stylish and durable pants' },
  { name: 'Track', slug: 'track', description: 'Premium active and track wear' },
  { name: 'Hoodie', slug: 'hoodie', description: 'Cozy and comfortable hoodies' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedDB();
