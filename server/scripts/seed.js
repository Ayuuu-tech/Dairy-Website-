require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('🌱 Starting seed...\n');

  try {
    // Run schema first
    const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
    await db.query(schema);
    console.log('✅ Schema created\n');

    // Clear existing data
    await db.query('DELETE FROM reviews');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM subscriptions');
    await db.query('DELETE FROM products');
    await db.query('DELETE FROM users');
    console.log('🧹 Cleared existing data\n');

    // Create users
    const adminHash = await bcrypt.hash('Admin@123', 12);
    const userHash = await bcrypt.hash('User@123', 12);

    const admin = (await db.query(
      "INSERT INTO users (name, phone, email, password_hash, role, addresses) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, role",
      ['Admin DairyFresh', '+91 9876543210', 'admin@dairyfresh.com', adminHash, 'admin', JSON.stringify([{ label: 'Office', street: '123 Dairy Road', city: 'Bangalore', pincode: '560001' }])]
    )).rows[0];

    const user = (await db.query(
      "INSERT INTO users (name, phone, email, password_hash, role, addresses) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, role",
      ['Rahul Kumar', '+91 9876543211', 'user@dairyfresh.com', userHash, 'customer', JSON.stringify([{ label: 'Home', street: 'HSR Layout, Sector 1', city: 'Bangalore', pincode: '560102' }, { label: 'Office', street: 'Koramangala 5th Block', city: 'Bangalore', pincode: '560095' }])]
    )).rows[0];

    console.log(`👤 Admin: ${admin.email} / Admin@123`);
    console.log(`👤 Customer: ${user.email} / User@123\n`);

    // Create products
    const products = [
      { name: 'Whole Milk (1L)', category: 'Milk', description: 'Farm fresh whole milk', variants: [{ label: '500ml', price: 30, stock: 100 }, { label: '1L', price: 55, stock: 3 }], images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400'] },
      { name: 'Toned Milk (1L)', category: 'Milk', description: 'Low fat toned milk', variants: [{ label: '500ml', price: 25, stock: 150 }, { label: '1L', price: 45, stock: 80 }], images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400'] },
      { name: 'Fresh Paneer (200g)', category: 'Paneer', description: 'Soft and fresh paneer', variants: [{ label: '200g', price: 80, stock: 60 }, { label: '500g', price: 180, stock: 40 }], images: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=400'] },
      { name: 'Natural Curd (500g)', category: 'Curd', description: 'Thick creamy curd', variants: [{ label: '250g', price: 25, stock: 90 }, { label: '500g', price: 45, stock: 70 }], images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400'] },
      { name: 'Pure Ghee (500ml)', category: 'Ghee', description: 'A2 cow ghee', variants: [{ label: '250ml', price: 250, stock: 30 }, { label: '500ml', price: 450, stock: 20 }], images: ['https://images.unsplash.com/photo-1631898039984-fd5e255ce8a4?q=80&w=400'] },
      { name: 'Cheddar Cheese (500g)', category: 'Paneer', description: 'Aged cheddar', variants: [{ label: '200g', price: 120, stock: 5 }, { label: '500g', price: 280, stock: 15 }], images: ['https://images.unsplash.com/photo-1618164436241-4473940d1f5c?q=80&w=400'] },
      { name: 'Unsalted Butter', category: 'Butter', description: 'Fresh unsalted butter', variants: [{ label: '100g', price: 55, stock: 12 }, { label: '500g', price: 240, stock: 8 }], images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=400'] },
      { name: 'Fresh Cream (200ml)', category: 'Cream', description: 'Whipping cream', variants: [{ label: '200ml', price: 60, stock: 45 }, { label: '500ml', price: 130, stock: 25 }], images: ['https://images.unsplash.com/photo-1625865636007-40d1a5b5d22a?q=80&w=400'] },
    ];

    for (const p of products) {
      await db.query(
        'INSERT INTO products (name, category, description, variants, images) VALUES ($1,$2,$3,$4,$5)',
        [p.name, p.category, p.description, JSON.stringify(p.variants), p.images]
      );
    }
    console.log(`📦 ${products.length} products created\n`);
    console.log('✅ Seed complete!');
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await db.pool.end();
    process.exit();
  }
}

seed();
