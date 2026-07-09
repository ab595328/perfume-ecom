import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'perfumes.db');

export async function getDbConnection() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function initDb() {
  const db = await getDbConnection();

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT NOT NULL,
      top_notes TEXT,
      middle_notes TEXT,
      base_notes TEXT,
      stock INTEGER DEFAULT 10
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      items TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );
  `);

  // Check if admin user already exists
  const adminUser = await db.get('SELECT * FROM users WHERE email = ?', ['admin@astraire.com']);
  if (!adminUser) {
    const adminPasswordHash = hashPassword('admin123');
    await db.run(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      ['admin@astraire.com', adminPasswordHash, 'admin']
    );
    console.log('Seeded admin user (admin@astraire.com / admin123)');
  }

  // Seed initial products if the table is empty
  const productCount = await db.get('SELECT COUNT(*) as count FROM products');
  if (productCount.count === 0) {
    const initialProducts = [
      {
        name: 'Oud Élixir',
        brand: 'Astraire Private Blend',
        description: 'An enigmatic, luxurious blend of precious Cambodian agarwood, rich leather, amberwood, and warm cardamom. A bold signature statement of prestige and timelessness.',
        price: 18500.00,
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop',
        category: 'Woody',
        top_notes: 'Cardamom, Rosewood, Sichuan Pepper',
        middle_notes: 'Oud (Agarwood), Sandalwood, Vetiver',
        base_notes: 'Tonka Bean, Vanilla, Amber, Leather',
        stock: 15
      },
      {
        name: 'Aurée',
        brand: 'Astraire Maison',
        description: 'A golden, velvet embrace of Bulgarian Damask rose, warm amber, and patchouli. Elegantly highlighted with pink pepper and delicate saffron.',
        price: 14000.00,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
        category: 'Floral',
        top_notes: 'Pink Pepper, Saffron, Bergamot',
        middle_notes: 'Damask Rose, Turkish Rose, Jasmine',
        base_notes: 'Patchouli, Amber, Vanilla, Musk',
        stock: 20
      },
      {
        name: 'Lumière',
        brand: 'Astraire L\'Eau',
        description: 'A brilliant, radiant burst of Mediterranean neroli, bitter orange, and sun-kissed bergamot resting on clean white musk and amberwood.',
        price: 12000.00,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop',
        category: 'Fresh',
        top_notes: 'Bergamot, Lemon, Petitgrain',
        middle_notes: 'Neroli, Orange Blossom, Jasmine',
        base_notes: 'White Musk, Amberwood, Vetiver',
        stock: 25
      },
      {
        name: 'Noir Extrême',
        brand: 'Astraire Private Blend',
        description: 'A dark, sophisticated composition of intense black cedar, leather, dry papyrus, and smoky tobacco notes wrapped in warm amber.',
        price: 16500.00,
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop',
        category: 'Woody',
        top_notes: 'Cardamom, Iris, Violet',
        middle_notes: 'Sandalwood, Papyrus, Virginia Cedar',
        base_notes: 'Leather, Amber, Musk',
        stock: 12
      },
      {
        name: 'Bleu Intense',
        brand: 'Astraire Maison',
        description: 'An intense, oceanic wood formulation combining deep sea salt, aquatic sage, blue ginger, and amberwood for an elegant, modern trail.',
        price: 14800.00,
        image: 'https://images.unsplash.com/photo-1588405748373-122b2321bc31?q=80&w=600&auto=format&fit=crop',
        category: 'Oriental',
        top_notes: 'Jasmine, Ylang-Ylang, Mandarin Orange',
        middle_notes: 'Tuberose, Orchid, Spices',
        base_notes: 'Madagascar Vanilla, Sandalwood, Patchouli, Amber',
        stock: 18
      },
      {
        name: 'Vert Émeraude',
        brand: 'Astraire L\'Eau',
        description: 'A vibrant, earthy vetiver masterpiece. Combines Haitian grass root extracts with bitter grapefruit, marine oakmoss, and mineral nuances.',
        price: 13200.00,
        image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=600&auto=format&fit=crop',
        category: 'Fresh',
        top_notes: 'Grapefruit, Bitter Orange, Sage',
        middle_notes: 'Gunmetal, Sea Salt, Nutmeg',
        base_notes: 'Haitian Vetiver, Oakmoss, Patchouli',
        stock: 8
      }
    ];

    for (const prod of initialProducts) {
      await db.run(`
        INSERT INTO products (name, brand, description, price, image, category, top_notes, middle_notes, base_notes, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prod.name, prod.brand, prod.description, prod.price, prod.image,
        prod.category, prod.top_notes, prod.middle_notes, prod.base_notes, prod.stock
      ]);
    }
    console.log('Seeded database with initial products in INR');
  }

  await db.close();
}
