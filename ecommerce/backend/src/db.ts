import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'database',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'bravio',
  user: process.env.POSTGRES_USER || 'bravio',
  password: process.env.POSTGRES_PASSWORD || 'changeme123',
});

export const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        external_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        document VARCHAR(50),
        amount INTEGER,
        status VARCHAR(50) DEFAULT 'Pending',
        pix_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database initialized and connected');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

export const saveOrder = async (orderData: any) => {
  try {
    const { external_id, name, email, phone, document, amount, status, pix_code } = orderData;
    await pool.query(
      `INSERT INTO orders (external_id, name, email, phone, document, amount, status, pix_code) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (external_id) DO NOTHING`,
      [external_id, name, email, phone, document, amount, status, pix_code]
    );
  } catch (error) {
    console.error('Error saving order:', error);
  }
};

export const updateOrderStatus = async (external_id: string, status: string) => {
  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE external_id = $2 RETURNING *`,
      [status, external_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating order status:', error);
    return null;
  }
};

export const getOrderByExternalId = async (external_id: string) => {
  try {
    const result = await pool.query(`SELECT * FROM orders WHERE external_id = $1`, [external_id]);
    return result.rows[0];
  } catch (error) {
    return null;
  }
};

export default pool;