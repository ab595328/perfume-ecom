import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { getDbConnection, initDb, hashPassword } from './db.js';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'AURA_SECRET_KEY_2026';

app.use(cors());
app.use(express.json());

// Initialize database
try {
  await initDb();
  console.log('Database initialized successfully.');
} catch (err) {
  console.error('Failed to initialize database:', err);
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin privileges required' });
  }
}

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = await getDbConnection();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    await db.close();

    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = await getDbConnection();
    const existing = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existing) {
      await db.close();
      return res.status(400).json({ error: 'User already registered' });
    }

    const hashedPassword = hashPassword(password);
    await db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, 'user']);
    const newUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    await db.close();

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({ token, user: { email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const db = await getDbConnection();
    const users = await db.all('SELECT id, email, role FROM users ORDER BY id DESC');
    await db.close();
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const db = await getDbConnection();
    const products = await db.all('SELECT * FROM products');
    await db.close();
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const db = await getDbConnection();
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    await db.close();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Fetch product detail error:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
  const { name, brand, description, price, image, category, top_notes, middle_notes, base_notes, stock } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  try {
    const db = await getDbConnection();
    const result = await db.run(`
      INSERT INTO products (name, brand, description, price, image, category, top_notes, middle_notes, base_notes, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, brand || '', description || '', price, image || '', category, top_notes || '', middle_notes || '', base_notes || '', stock || 10]);
    await db.close();

    res.status(201).json({ id: result.lastID, message: 'Product created successfully' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  const { name, brand, description, price, image, category, top_notes, middle_notes, base_notes, stock } = req.body;
  
  try {
    const db = await getDbConnection();
    const existing = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) {
      await db.close();
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.run(`
      UPDATE products 
      SET name = ?, brand = ?, description = ?, price = ?, image = ?, category = ?, top_notes = ?, middle_notes = ?, base_notes = ?, stock = ?
      WHERE id = ?
    `, [
      name !== undefined ? name : existing.name,
      brand !== undefined ? brand : existing.brand,
      description !== undefined ? description : existing.description,
      price !== undefined ? price : existing.price,
      image !== undefined ? image : existing.image,
      category !== undefined ? category : existing.category,
      top_notes !== undefined ? top_notes : existing.top_notes,
      middle_notes !== undefined ? middle_notes : existing.middle_notes,
      base_notes !== undefined ? base_notes : existing.base_notes,
      stock !== undefined ? stock : existing.stock,
      req.params.id
    ]);
    await db.close();

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const db = await getDbConnection();
    const existing = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) {
      await db.close();
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    await db.close();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Order Routes
app.post('/api/orders', async (req, res) => {
  const { user_name, user_email, items, total_amount } = req.body;
  if (!user_name || !user_email || !items || !total_amount) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const db = await getDbConnection();
    const result = await db.run(`
      INSERT INTO orders (user_name, user_email, items, total_amount, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `, [user_name, user_email, JSON.stringify(items), total_amount, new Date().toISOString()]);
    await db.close();

    res.status(201).json({ id: result.lastID, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', authenticateToken, isAdmin, async (req, res) => {
  try {
    const db = await getDbConnection();
    const orders = await db.all('SELECT * FROM orders ORDER BY id DESC');
    await db.close();

    // Parse the items JSON for each order
    const formattedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/user/:email', async (req, res) => {
  try {
    const db = await getDbConnection();
    const orders = await db.all('SELECT * FROM orders WHERE user_email = ? ORDER BY id DESC', [req.params.email]);
    await db.close();

    const formattedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Fetch user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

app.put('/api/orders/:id', authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const db = await getDbConnection();
    const existing = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!existing) {
      await db.close();
      return res.status(404).json({ error: 'Order not found' });
    }

    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    await db.close();

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
