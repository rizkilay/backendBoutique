const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'boutique_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// =============================
// GET inventory stats
// =============================
app.get('/api/inventory-stats', async (req, res) => {
    try {

        const [rows] = await pool.query(
            'SELECT * FROM inventory_stats WHERE id = 1'
        );

        const stats = rows[0] || {};

        const [history] = await pool.query(
            'SELECT * FROM daily_stats ORDER BY date DESC LIMIT 30'
        );

        res.json({
            ...stats,
            history: history.reverse()
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ error: 'Database error' });

    }
});


// =============================
// GET out of stock products
// =============================
app.get('/api/out-of-stock', async (req, res) => {

    try {

        const [rows] = await pool.query(
            'SELECT * FROM out_of_stock_products'
        );

        res.json(rows);

    } catch (err) {

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

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();


        // =============================
        // Update main stats
        // =============================
        await connection.query(`
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
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                today_sales = VALUES(today_sales),
                monthly_sales = VALUES(monthly_sales),
                total_expenses = VALUES(total_expenses),
                estimated_profit = VALUES(estimated_profit),
                available_funds = VALUES(available_funds),
                out_of_stock_count = VALUES(out_of_stock_count),
                total_sales = VALUES(total_sales),
                total_purchases = VALUES(total_purchases)
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

                await connection.query(`
                    INSERT INTO daily_stats (date, sales, purchases)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        sales = VALUES(sales),
                        purchases = VALUES(purchases)
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
        await connection.query('DELETE FROM out_of_stock_products');

        if (Array.isArray(out_of_stock_list)) {

            for (const p of out_of_stock_list) {

                await connection.query(`
                    INSERT INTO out_of_stock_products
                    (product_id, name, category, price)
                    VALUES (?, ?, ?, ?)
                `, [
                    p.id,
                    p.name,
                    p.category,
                    p.price
                ]);

            }

        }


        await connection.commit();

        res.json({
            message: 'Inventory sync successful'
        });

    } catch (err) {

        await connection.rollback();

        console.error(err);

        res.status(500).json({
            error: 'Sync failed'
        });

    } finally {

        connection.release();

    }

});


// =============================
// GET cotisation summary
// =============================
app.get('/api/summary', async (req, res) => {
    try {
        const [recent] = await pool.query('SELECT * FROM cotisations ORDER BY date DESC LIMIT 50');
        const [withdrawals] = await pool.query('SELECT * FROM cotisation_withdrawals ORDER BY date DESC LIMIT 50');
        
        res.json({
            summary: {},
            recent: recent || [],
            withdrawals: withdrawals || []
        });
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
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
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(`
            CREATE TABLE IF NOT EXISTS cotisations (
                id INT PRIMARY KEY,
                amount DECIMAL(15, 2),
                date VARCHAR(255),
                note TEXT,
                source VARCHAR(255),
                category VARCHAR(255),
                partner_id INT
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS cotisation_withdrawals (
                id INT PRIMARY KEY,
                cotisation_id INT,
                amount DECIMAL(15, 2),
                date VARCHAR(255),
                motif TEXT,
                source VARCHAR(255)
            )
        `);

        await connection.query('DELETE FROM cotisations');
        await connection.query('DELETE FROM cotisation_withdrawals');

        if (Array.isArray(cotisations) && cotisations.length > 0) {
            for (const c of cotisations) {
                await connection.query(`
                    INSERT INTO cotisations (id, amount, date, note, source, category, partner_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [c.id, c.amount, c.date, c.note, c.source, c.category, c.partner_id]);
            }
        }

        if (Array.isArray(withdrawals) && withdrawals.length > 0) {
            for (const w of withdrawals) {
                await connection.query(`
                    INSERT INTO cotisation_withdrawals (id, cotisation_id, amount, date, motif, source)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [w.id, w.cotisation_id, w.amount, w.date, w.motif, w.source]);
            }
        }

        await connection.commit();
        res.json({ message: 'Cotisation sync successful' });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Sync failed' });
    } finally {
        connection.release();
    }
});


// =============================
// Start server
// =============================
app.listen(port, () => {

    console.log(`Inventory Backend running on port ${port}`);

});