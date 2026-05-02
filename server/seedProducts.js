const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const images = {
  'Milk': [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570197782017-d2d41a5477d9?q=80&w=600&auto=format&fit=crop',
    'https://plus.unsplash.com/premium_photo-1664302152996-327ceaa0a1df?q=80&w=600&auto=format&fit=crop'
  ],
  'Paneer': [
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc3?q=80&w=600&auto=format&fit=crop',
    'https://plus.unsplash.com/premium_photo-1695297516668-cb0a9e22dbdb?q=80&w=600&auto=format&fit=crop'
  ],
  'Ghee': [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop'
  ],
  'Curd': [
    'https://images.unsplash.com/photo-1628188373322-83fc00f40d85?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?q=80&w=600&auto=format&fit=crop'
  ],
  'Butter': [
    'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1528750717929-32abb73d3bad?q=80&w=600&auto=format&fit=crop'
  ],
  'Cream': [
    'https://images.unsplash.com/photo-1626200419188-f1a1be430030?q=80&w=600&auto=format&fit=crop',
    'https://plus.unsplash.com/premium_photo-1667516805825-9ba6bd72ec13?q=80&w=600&auto=format&fit=crop'
  ],
  'Other': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop'
  ]
};

const templates = [
  { name: 'Farm Fresh {Type}' },
  { name: 'Organic {Type}' },
  { name: 'Pure {Type}' },
  { name: 'Premium {Type}' },
  { name: 'Classic {Type}' },
  { name: 'A2 {Type}' },
  { name: 'Diet {Type}' },
  { name: 'Rich {Type}' },
];

const variantsList = [
  [{ label: '500ml', price: 35, stock: 100 }, { label: '1L', price: 68, stock: 100 }],
  [{ label: '250g', price: 80, stock: 50 }, { label: '500g', price: 150, stock: 50 }],
  [{ label: '200g', price: 40, stock: 100 }, { label: '400g', price: 75, stock: 80 }],
  [{ label: '500g', price: 300, stock: 40 }, { label: '1kg', price: 580, stock: 30 }],
  [{ label: '100g', price: 50, stock: 150 }, { label: '500g', price: 230, stock: 60 }]
];

const types = {
  'Milk': ['Cow Milk', 'Buffalo Milk', 'Toned Milk', 'Full Cream Milk', 'Skimmed Milk'],
  'Paneer': ['Malai Paneer', 'Fresh Paneer', 'Low Fat Paneer', 'Masala Paneer'],
  'Ghee': ['Cow Ghee', 'Desi Ghee', 'Buffalo Ghee', 'A2 Cow Ghee'],
  'Curd': ['Thick Curd', 'Misti Doi', 'Probiotic Curd', 'Low Fat Curd'],
  'Butter': ['Salted Butter', 'Unsalted White Butter', 'Garlic Butter'],
  'Cream': ['Fresh Cream', 'Whipping Cream', 'Sour Cream'],
  'Other': ['Flavored Milk', 'Lassi', 'Chaas', 'Buttermilk', 'Kefir']
};

function generateProducts() {
  const products = [];
  const categories = Object.keys(types);
  let count = 0;

  for (let cat of categories) {
    for (let type of types[cat]) {
      // Create a few variations for each type
      for (let i = 0; i < 2; i++) {
        let temp = templates[Math.floor(Math.random() * templates.length)];
        let pName = temp.name.replace('{Type}', type);
        let pImages = [images[cat][Math.floor(Math.random() * images[cat].length)]];
        let pVariants = variantsList[Math.floor(Math.random() * variantsList.length)];
        
        products.push({
          name: pName,
          category: cat,
          description: `Enjoy the natural goodness of ${pName}. Sourced from the finest farms and processed with care to maintain the highest quality standards.`,
          variants: pVariants,
          images: pImages,
          available: true
        });
        count++;
      }
    }
  }
  
  // Mix them up
  return products.sort(() => 0.5 - Math.random()).slice(0, 55);
}

async function seed() {
  const products = generateProducts();
  console.log(`Generated ${products.length} products to insert.`);
  let inserted = 0;
  for (let p of products) {
    try {
      await pool.query(
        'INSERT INTO products (name, category, description, variants, images, available) VALUES ($1, $2, $3, $4, $5, $6)',
        [p.name, p.category, p.description, JSON.stringify(p.variants), p.images, p.available]
      );
      inserted++;
    } catch (err) {
      console.error('Error inserting', p.name, err.message);
    }
  }
  console.log(`Successfully inserted ${inserted} products.`);
  process.exit();
}

seed();
