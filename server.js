const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST || 'db.hkvujwkxxnivjgjjsdja.supabase.co',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
});

// =============================
// GET inventory stats
// =============================
app.get('/api/inventory-stats', async (req, res) => {
    try {
        const statsResult = await pool.query(
            'SELECT * FROM inventory_stats WHERE id = 1'
        );

        const stats = statsResult.rows[0] || {};

        const historyResult = await pool.query(
            'SELECT * FROM daily_stats ORDER BY date DESC LIMIT 30'
        );

        res.json({
            ...stats,
            history: historyResult.rows.reverse()
        });

    } catch (err) {
        if (err.code === '42P01') {
            return res.json({ history: [] });
        }
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// =============================
// GET out of stock products
// =============================
app.get('/api/out-of-stock', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM out_of_stock_products'
        );

        res.json(result.rows);

    } catch (err) {
        if (err.code === '42P01') {
            return res.json([]);
        }
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// =============================
// POST sync inventory
// =============================
app.post('/api/sync-inventory', async (req, res) => {
    const {
        today_sales,
        monthly_sales,
        total_expenses,
        estimated_profit,
        available_funds,
        out_of_stock_count,
        total_sales,
        total_purchases,
        sales_history,
        purchase_history,
        out_of_stock_list
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS inventory_stats (
                id INT PRIMARY KEY,
                today_sales DECIMAL(15, 2),
                monthly_sales DECIMAL(15, 2),
                total_expenses DECIMAL(15, 2),
                estimated_profit DECIMAL(15, 2),
                available_funds DECIMAL(15, 2),
                out_of_stock_count INT,
                total_sales DECIMAL(15, 2),
                total_purchases DECIMAL(15, 2)
            )
        `);
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS daily_stats (
                date VARCHAR(255) PRIMARY KEY,
                sales DECIMAL(15, 2),
                purchases DECIMAL(15, 2)
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS out_of_stock_products (
                product_id INT,
                name VARCHAR(255),
                category VARCHAR(255),
                price DECIMAL(15, 2)
            )
        `);


        // =============================
        // Update main stats
        // =============================
        await client.query(`
            INSERT INTO inventory_stats (
                id,
                today_sales,
                monthly_sales,
                total_expenses,
                estimated_profit,
                available_funds,
                out_of_stock_count,
                total_sales,
                total_purchases
            )
            VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
                today_sales = EXCLUDED.today_sales,
                monthly_sales = EXCLUDED.monthly_sales,
                total_expenses = EXCLUDED.total_expenses,
                estimated_profit = EXCLUDED.estimated_profit,
                available_funds = EXCLUDED.available_funds,
                out_of_stock_count = EXCLUDED.out_of_stock_count,
                total_sales = EXCLUDED.total_sales,
                total_purchases = EXCLUDED.total_purchases
        `, [
            today_sales,
            monthly_sales,
            total_expenses,
            estimated_profit,
            available_funds,
            out_of_stock_count,
            total_sales,
            total_purchases
        ]);


        // =============================
        // Update daily stats
        // =============================
        if (Array.isArray(sales_history)) {
            for (const s of sales_history) {
                const purchase = purchase_history
                    ? purchase_history.find(p => p.date === s.date)
                    : null;

                await client.query(`
                    INSERT INTO daily_stats (date, sales, purchases)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (date) DO UPDATE SET
                        sales = EXCLUDED.sales,
                        purchases = EXCLUDED.purchases
                `, [
                    s.date,
                    s.total,
                    purchase ? purchase.total : 0
                ]);
            }
        }


        // =============================
        // Update out of stock
        // =============================
        await client.query('DELETE FROM out_of_stock_products');

        if (Array.isArray(out_of_stock_list)) {
            for (const p of out_of_stock_list) {
                await client.query(`
                    INSERT INTO out_of_stock_products
                    (product_id, name, category, price)
                    VALUES ($1, $2, $3, $4)
                `, [
                    p.id,
                    p.name,
                    p.category,
                    p.price
                ]);
            }
        }

        await client.query('COMMIT');

        res.json({
            message: 'Inventory sync successful'
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({
            error: 'Sync failed'
        });
    } finally {
        client.release();
    }
});


// =============================
// GET cotisation summary
// =============================
app.get('/api/summary', async (req, res) => {
    try {
        const recentResult = await pool.query('SELECT * FROM cotisations ORDER BY date DESC LIMIT 50');
        const withdrawalsResult = await pool.query('SELECT * FROM cotisation_withdrawals ORDER BY date DESC LIMIT 50');
        
        res.json({
            summary: {},
            recent: recentResult.rows || [],
            withdrawals: withdrawalsResult.rows || []
        });
    } catch (err) {
        if (err.code === '42P01') {
            return res.json({ summary: {}, recent: [], withdrawals: [] });
        }
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// =============================
// POST sync cotisations
// =============================
app.post('/api/sync', async (req, res) => {
    const { cotisations, withdrawals } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS cotisations (
                id BIGINT PRIMARY KEY,
                amount DECIMAL(15, 2),
                date VARCHAR(255),
                note TEXT,
                source VARCHAR(255),
                category VARCHAR(255),
                partner_id BIGINT
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS cotisation_withdrawals (
                id BIGINT PRIMARY KEY,
                cotisation_id BIGINT,
                amount DECIMAL(15, 2),
                date VARCHAR(255),
                motif TEXT,
                source VARCHAR(255)
            )
        `);

        await client.query('DELETE FROM cotisations');
        await client.query('DELETE FROM cotisation_withdrawals');

        if (Array.isArray(cotisations) && cotisations.length > 0) {
            for (const c of cotisations) {
                await client.query(`
                    INSERT INTO cotisations (id, amount, date, note, source, category, partner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [c.id, c.amount, c.date, c.note, c.source, c.category, c.partner_id]);
            }
        }

        if (Array.isArray(withdrawals) && withdrawals.length > 0) {
            for (const w of withdrawals) {
                await client.query(`
                    INSERT INTO cotisation_withdrawals (id, cotisation_id, amount, date, motif, source)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [w.id, w.cotisation_id, w.amount, w.date, w.motif, w.source]);
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Cotisation sync successful' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Sync failed' });
    } finally {
        client.release();
    }
});


// =============================
// Start server
// =============================
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Inventory Backend running on port ${port}`);
    });
}

module.exports = app;