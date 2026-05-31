const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'boutique_secret_key_2024_very_long_and_secure';

app.use(cors());
app.use(express.json());

const poolConfig = process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        // pgbouncer en mode transaction ne supporte pas les prepared statements
        max: 10,
    }
    : {
        host: process.env.DB_HOST || 'db.hkvujwkxxnivjgjjsdja.supabase.co',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'Takya@5#Moi',
        ssl: { rejectUnauthorized: false },
        family: 4
    };

const pool = new Pool(poolConfig);

const dbHost = process.env.DATABASE_URL 
    ? new URL(process.env.DATABASE_URL).hostname 
    : poolConfig.host;
console.log(`Attempting to connect to database at: ${dbHost}`);

// =============================
// INITIALISATION DES TABLES
// =============================
async function initDatabase() {
    const client = await pool.connect();
    try {
        // Table admin_users
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'Éditeur',
                status VARCHAR(50) DEFAULT 'Actif',
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Table boutiques
        await client.query(`
            CREATE TABLE IF NOT EXISTS boutiques (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(255),
                neighborhood VARCHAR(255),
                phone VARCHAR(50),
                manager VARCHAR(255),
                status VARCHAR(50) DEFAULT 'Actif',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Créer admin par défaut si n'existe pas
        const existing = await client.query(`SELECT id FROM admin_users WHERE email = $1`, ['admin@boutique.com']);
        if (existing.rows.length === 0) {
            const hash = await bcrypt.hash('Admin@1234', 10);
            await client.query(`
                INSERT INTO admin_users (name, email, password_hash, role, status)
                VALUES ($1, $2, $3, $4, $5)
            `, ['Administrateur', 'admin@boutique.com', hash, 'Administrateur', 'Actif']);
            console.log('✅ Admin par défaut créé: admin@boutique.com / Admin@1234');
        }

        console.log('✅ Tables initialisées avec succès');
    } catch (err) {
        console.error('❌ Erreur initialisation DB:', err.message);
    } finally {
        client.release();
    }
}

initDatabase();

// =============================
// MIDDLEWARE AUTH JWT
// =============================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalide ou expiré' });
        req.user = user;
        next();
    });
}

// =============================
// AUTH — LOGIN
// =============================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM admin_users WHERE email = $1 AND status = 'Actif'`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Mettre à jour last_login
        await pool.query(`UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`, [user.id]);

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
});

// =============================
// AUTH — ME
// =============================
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, status, last_login, created_at FROM admin_users WHERE id = $1`,
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =============================
// MEMBRES — CRUD
// =============================

// GET tous les membres
app.get('/api/members', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, status, last_login, created_at FROM admin_users ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST créer un membre
app.post('/api/members', authenticateToken, async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }

    try {
        const existing = await pool.query(`SELECT id FROM admin_users WHERE email = $1`, [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Un membre avec cet email existe déjà' });
        }

        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(`
            INSERT INTO admin_users (name, email, password_hash, role, status)
            VALUES ($1, $2, $3, $4, 'Actif')
            RETURNING id, name, email, role, status, created_at
        `, [name, email, hash, role || 'Éditeur']);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
});

// PUT modifier un membre
app.put('/api/members/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;

    try {
        // Vérifier que l'email n'est pas pris par un autre
        if (email) {
            const existing = await pool.query(
                `SELECT id FROM admin_users WHERE email = $1 AND id != $2`,
                [email, id]
            );
            if (existing.rows.length > 0) {
                return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre membre' });
            }
        }

        let query, params;
        if (password && password.trim() !== '') {
            const hash = await bcrypt.hash(password, 10);
            query = `
                UPDATE admin_users SET name=$1, email=$2, role=$3, status=$4, password_hash=$5
                WHERE id=$6
                RETURNING id, name, email, role, status, last_login, created_at
            `;
            params = [name, email, role, status, hash, id];
        } else {
            query = `
                UPDATE admin_users SET name=$1, email=$2, role=$3, status=$4
                WHERE id=$5
                RETURNING id, name, email, role, status, last_login, created_at
            `;
            params = [name, email, role, status, id];
        }

        const result = await pool.query(query, params);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Membre non trouvé' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
});

// DELETE supprimer un membre
app.delete('/api/members/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // Empêcher de supprimer son propre compte
    if (parseInt(id) === req.user.id) {
        return res.status(403).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    try {
        const result = await pool.query(
            `DELETE FROM admin_users WHERE id = $1 RETURNING id, name`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Membre non trouvé' });
        res.json({ message: `Membre "${result.rows[0].name}" supprimé avec succès` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =============================
// BOUTIQUES — CRUD
// =============================

// GET toutes les boutiques
app.get('/api/stores', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM boutiques ORDER BY created_at DESC`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST créer une boutique
app.post('/api/stores', authenticateToken, async (req, res) => {
    const { name, city, neighborhood, phone, manager } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Le nom de la boutique est requis' });
    }

    try {
        const result = await pool.query(`
            INSERT INTO boutiques (name, city, neighborhood, phone, manager, status)
            VALUES ($1, $2, $3, $4, $5, 'Actif')
            RETURNING *
        `, [name, city || '', neighborhood || '', phone || '', manager || '']);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
});

// PUT modifier une boutique
app.put('/api/stores/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, city, neighborhood, phone, manager, status } = req.body;

    try {
        const result = await pool.query(`
            UPDATE boutiques SET name=$1, city=$2, neighborhood=$3, phone=$4, manager=$5, status=$6
            WHERE id=$7
            RETURNING *
        `, [name, city || '', neighborhood || '', phone || '', manager || '', status || 'Actif', id]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Boutique non trouvée' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
});

// DELETE supprimer une boutique
app.delete('/api/stores/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM boutiques WHERE id = $1 RETURNING id, name`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Boutique non trouvée' });
        res.json({ message: `Boutique "${result.rows[0].name}" supprimée avec succès` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =============================
// GET inventory stats
// =============================
app.get('/api/inventory-stats', async (req, res) => {
    try {
        const statsResult = await pool.query('SELECT * FROM inventory_stats WHERE id = 1');
        const stats = statsResult.rows[0] || {};
        const historyResult = await pool.query('SELECT * FROM daily_stats ORDER BY date DESC LIMIT 30');
        res.json({
            ...stats,
            history: historyResult.rows.reverse()
        });
    } catch (err) {
        if (err.code === '42P01') return res.json({ history: [] });
        console.error(err);
        res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
    }
});

// =============================
// GET out of stock products
// =============================
app.get('/api/out-of-stock', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM out_of_stock_products');
        res.json(result.rows);
    } catch (err) {
        if (err.code === '42P01') return res.json([]);
        console.error(err);
        res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
    }
});

// =============================
// POST sync inventory
// =============================
app.post('/api/sync-inventory', async (req, res) => {
    const {
        today_sales, monthly_sales, total_expenses, estimated_profit,
        available_funds, out_of_stock_count, total_sales, total_purchases,
        sales_history, purchase_history, out_of_stock_list, all_products
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
        
        await client.query(`CREATE TABLE IF NOT EXISTS daily_stats (date VARCHAR(255) PRIMARY KEY, sales DECIMAL(15, 2), purchases DECIMAL(15, 2))`);
        await client.query(`CREATE TABLE IF NOT EXISTS out_of_stock_products (product_id INT, name VARCHAR(255), category VARCHAR(255), price DECIMAL(15, 2))`);
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT PRIMARY KEY,
                name VARCHAR(255),
                category VARCHAR(255),
                price DECIMAL(15, 2),
                quantity INT DEFAULT 0,
                image VARCHAR(500),
                brandName VARCHAR(255),
                description TEXT,
                tags TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT');
        await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT');
        await client.query(`
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                product_id INT,
                transaction_id VARCHAR(255) UNIQUE,
                quantity INT,
                amount DECIMAL(15, 2),
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);

        await client.query(`
            INSERT INTO inventory_stats (id, today_sales, monthly_sales, total_expenses, estimated_profit, available_funds, out_of_stock_count, total_sales, total_purchases)
            VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
                today_sales = EXCLUDED.today_sales, monthly_sales = EXCLUDED.monthly_sales,
                total_expenses = EXCLUDED.total_expenses, estimated_profit = EXCLUDED.estimated_profit,
                available_funds = EXCLUDED.available_funds, out_of_stock_count = EXCLUDED.out_of_stock_count,
                total_sales = EXCLUDED.total_sales, total_purchases = EXCLUDED.total_purchases
        `, [today_sales, monthly_sales, total_expenses, estimated_profit, available_funds, out_of_stock_count, total_sales, total_purchases]);

        if (Array.isArray(sales_history)) {
            for (const s of sales_history) {
                const purchase = purchase_history ? purchase_history.find(p => p.date === s.date) : null;
                await client.query(`
                    INSERT INTO daily_stats (date, sales, purchases)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (date) DO UPDATE SET sales = EXCLUDED.sales, purchases = EXCLUDED.purchases
                `, [s.date, s.total, purchase ? purchase.total : 0]);
            }
        }

        await client.query('DELETE FROM out_of_stock_products');
        if (Array.isArray(out_of_stock_list)) {
            for (const p of out_of_stock_list) {
                await client.query(`INSERT INTO out_of_stock_products (product_id, name, category, price) VALUES ($1, $2, $3, $4)`, [p.id, p.name, p.category, p.price]);
            }
        }

        if (Array.isArray(all_products)) {
            for (const p of all_products) {
                const img = p.image_path || p.image || '';
                await client.query(`
                    INSERT INTO products (id, name, category, price, quantity, image, brandName, description, tags, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name, category = EXCLUDED.category, price = EXCLUDED.price,
                        quantity = EXCLUDED.quantity, image = EXCLUDED.image, brandName = EXCLUDED.brandName,
                        description = EXCLUDED.description, tags = EXCLUDED.tags,
                        updated_at = CURRENT_TIMESTAMP
                `, [p.id, p.name, p.category, p.price, p.quantity || 0, img, p.brandName || '', p.description || '', p.tags || '']);
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Inventory sync successful' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Sync failed', details: err.message, code: err.code });
    } finally {
        client.release();
    }
});

// =============================
// GET products for User UI
// =============================
app.get('/api/products', async (req, res) => {
    try {
        const { since } = req.query;
        let query = 'SELECT * FROM products';
        let params = [];
        
        if (since && since !== 'null' && since !== 'undefined') {
            query += ' WHERE updated_at > $1';
            params.push(since);
        } else {
            query += ' WHERE quantity > 0';
        }
        
        const result = await pool.query(query, params);
        res.json({
            products: result.rows,
            server_time: new Date().toISOString()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// =============================
// POST record sale from User UI
// =============================
app.post('/api/sales', async (req, res) => {
    const { product_id, transaction_id, quantity, amount } = req.body;
    if (!product_id || !transaction_id || !quantity || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const existingResult = await client.query('SELECT id FROM sales WHERE transaction_id = $1', [transaction_id]);
        if (existingResult.rows.length > 0) {
            await client.query('COMMIT');
            return res.json({ message: 'Sale already recorded (duplicate ignored)', sale_id: existingResult.rows[0].id });
        }
        const result = await client.query(`INSERT INTO sales (product_id, transaction_id, quantity, amount) VALUES ($1, $2, $3, $4) RETURNING id`, [product_id, transaction_id, quantity, amount]);
        await client.query(`UPDATE products SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [quantity, product_id]);
        await client.query('COMMIT');
        res.json({ message: 'Sale recorded successfully', sale_id: result.rows[0].id });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Sale failed' });
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
        res.json({ summary: {}, recent: recentResult.rows || [], withdrawals: withdrawalsResult.rows || [] });
    } catch (err) {
        if (err.code === '42P01') return res.json({ summary: {}, recent: [], withdrawals: [] });
        console.error(err);
        res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
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
        await client.query(`CREATE TABLE IF NOT EXISTS cotisations (id BIGINT PRIMARY KEY, amount DECIMAL(15, 2), date VARCHAR(255), note TEXT, source VARCHAR(255), category VARCHAR(255), partner_id BIGINT)`);
        await client.query(`CREATE TABLE IF NOT EXISTS cotisation_withdrawals (id BIGINT PRIMARY KEY, cotisation_id BIGINT, amount DECIMAL(15, 2), date VARCHAR(255), motif TEXT, source VARCHAR(255))`);
        await client.query('DELETE FROM cotisations');
        await client.query('DELETE FROM cotisation_withdrawals');
        if (Array.isArray(cotisations)) {
            for (const c of cotisations) {
                await client.query(`INSERT INTO cotisations (id, amount, date, note, source, category, partner_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [c.id, c.amount, c.date, c.note, c.source, c.category, c.partner_id]);
            }
        }
        if (Array.isArray(withdrawals)) {
            for (const w of withdrawals) {
                await client.query(`INSERT INTO cotisation_withdrawals (id, cotisation_id, amount, date, motif, source) VALUES ($1, $2, $3, $4, $5, $6)`, [w.id, w.cotisation_id, w.amount, w.date, w.motif, w.source]);
            }
        }
        await client.query('COMMIT');
        res.json({ message: 'Cotisation sync successful' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Sync failed', details: err.message, code: err.code });
    } finally {
        client.release();
    }
});

// =============================
// MOBILE SYNC RELAY
// =============================

app.post('/api/sync-exits', async (req, res) => {
    const exits = req.body;
    if (!Array.isArray(exits)) return res.status(400).json({ error: 'Expected array of exits' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            CREATE TABLE IF NOT EXISTS mobile_exits (
                uuid VARCHAR(255) PRIMARY KEY,
                product_id INT,
                name VARCHAR(255),
                quantity INT,
                amount DECIMAL(15, 2),
                client_id INT,
                created_at TIMESTAMP,
                pushed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        for (const e of exits) {
            await client.query(`
                INSERT INTO mobile_exits (uuid, product_id, name, quantity, amount, client_id, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (uuid) DO NOTHING
            `, [e.uuid, e.product_id, e.name, e.quantity, e.amount, e.client_id, e.created_at]);
        }
        await client.query('COMMIT');
        res.json({ message: 'Exits synced successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Sync exits failed' });
    } finally {
        client.release();
    }
});

app.post('/api/sync-expenses', async (req, res) => {
    const expenses = req.body;
    if (!Array.isArray(expenses)) return res.status(400).json({ error: 'Expected array of expenses' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            CREATE TABLE IF NOT EXISTS mobile_expenses (
                uuid VARCHAR(255) PRIMARY KEY,
                reason VARCHAR(255),
                amount DECIMAL(15, 2),
                category VARCHAR(255),
                datetime TIMESTAMP,
                description TEXT,
                source VARCHAR(255),
                financeur_id VARCHAR(255),
                pushed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        for (const e of expenses) {
            await client.query(`
                INSERT INTO mobile_expenses (uuid, reason, amount, category, datetime, description, source, financeur_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (uuid) DO NOTHING
            `, [e.uuid, e.reason, e.amount, e.category, e.datetime, e.description, e.source, e.financeur_id]);
        }
        await client.query('COMMIT');
        res.json({ message: 'Expenses synced successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Sync expenses failed' });
    } finally {
        client.release();
    }
});

app.post('/api/sync-cotisations', async (req, res) => {
    const cotisations = req.body;
    if (!Array.isArray(cotisations)) return res.status(400).json({ error: 'Expected array of cotisations' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            CREATE TABLE IF NOT EXISTS mobile_cotisations (
                uuid VARCHAR(255) PRIMARY KEY,
                amount DECIMAL(15, 2),
                date VARCHAR(255),
                note TEXT,
                source VARCHAR(255),
                category VARCHAR(255),
                partner_id INT,
                pushed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        for (const c of cotisations) {
            await client.query(`
                INSERT INTO mobile_cotisations (uuid, amount, date, note, source, category, partner_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (uuid) DO NOTHING
            `, [c.uuid, c.amount, c.date, c.note, c.source, c.category, c.partner_id]);
        }
        await client.query('COMMIT');
        res.json({ message: 'Cotisations synced successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Sync cotisations failed' });
    } finally {
        client.release();
    }
});

app.get('/api/get-mobile-data', async (req, res) => {
    try {
        const exits = await pool.query('SELECT * FROM mobile_exits');
        const expenses = await pool.query('SELECT * FROM mobile_expenses');
        const cotisations = await pool.query('SELECT * FROM mobile_cotisations');

        res.json({
            exits: exits.rows,
            expenses: expenses.rows,
            cotisations: cotisations.rows
        });
    } catch (err) {
        if (err.code === '42P01') {
            return res.json({ exits: [], expenses: [], cotisations: [] });
        }
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Inventory Backend running on port ${port}`);
    });
}

module.exports = app;
