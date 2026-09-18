const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const target = `        if (Array.isArray(all_products)) {
            for (const p of all_products) {
                const img = p.image_path || p.image || '';
                await client.query(\``;

const replacement = `        if (Array.isArray(all_products)) {
            for (const p of all_products) {
                let img = p.image_path || p.image || '';
                if (p.image_base64) {
                    try {
                        const uploadsDir = path.join(__dirname, 'src', 'public', 'uploads');
                        if (!fs.existsSync(uploadsDir)) {
                            fs.mkdirSync(uploadsDir, { recursive: true });
                        }
                        const ext = p.image_ext || 'jpg';
                        const filename = 'img_' + p.id + '_' + Date.now() + '.' + ext;
                        const filepath = path.join(uploadsDir, filename);
                        fs.writeFileSync(filepath, Buffer.from(p.image_base64, 'base64'));
                        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
                        img = protocol + '://' + req.headers.host + '/uploads/' + filename;
                    } catch (e) {
                        console.error('Error saving image:', e);
                    }
                }
                await client.query(\``;

content = content.replace(target, replacement);
fs.writeFileSync('server.js', content, 'utf8');