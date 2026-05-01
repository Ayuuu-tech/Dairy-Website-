const db = require('../db');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, available } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let i = 1;

    if (category) { query += ` AND category = $${i++}`; params.push(category); }
    if (available !== undefined) { query += ` AND available = $${i++}`; params.push(available === 'true'); }
    if (search) { query += ` AND name ILIKE $${i++}`; params.push(`%${search}%`); }
    query += ' ORDER BY created_at DESC';

    const { rows } = await db.query(query, params);
    res.json({ products: rows });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error fetching products' }); }
};

exports.getProduct = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ product: rows[0] });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, variants, images, available, description } = req.body;
    if (!name || !category || !variants || variants.length === 0) return res.status(400).json({ message: 'Name, category, and variants required' });

    const { rows } = await db.query(
      'INSERT INTO products (name, category, description, variants, images, available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, category, description || '', JSON.stringify(variants), images || [], available !== false]
    );
    res.status(201).json({ message: 'Product created', product: rows[0] });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error creating product' }); }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, category, variants, images, available, description } = req.body;
    const existing = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Product not found' });

    const p = existing.rows[0];
    const { rows } = await db.query(
      'UPDATE products SET name=$1, category=$2, description=$3, variants=$4, images=$5, available=$6 WHERE id=$7 RETURNING *',
      [name || p.name, category || p.category, description !== undefined ? description : p.description, variants ? JSON.stringify(variants) : p.variants, images || p.images, available !== undefined ? available : p.available, req.params.id]
    );
    res.json({ message: 'Product updated', product: rows[0] });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error updating product' }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error deleting product' }); }
};

exports.addReview = async (req, res) => {
  try {
    const { stars, review } = req.body;
    if (!stars || stars < 1 || stars > 5) return res.status(400).json({ message: 'Stars must be 1-5' });

    const existing = await db.query('SELECT id FROM reviews WHERE product_id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Already reviewed' });

    await db.query('INSERT INTO reviews (product_id, user_id, stars, review) VALUES ($1, $2, $3, $4)', [req.params.id, req.user.id, stars, review || '']);
    res.status(201).json({ message: 'Review added' });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
};

exports.getReviews = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT r.*, u.name as user_name, u.email as user_email FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC',
      [req.params.id]
    );
    const avg = rows.length > 0 ? Math.round((rows.reduce((s, r) => s + r.stars, 0) / rows.length) * 10) / 10 : 0;
    res.json({ reviews: rows, avgRating: avg, totalReviews: rows.length });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
};
