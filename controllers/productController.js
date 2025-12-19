const db = require('../config/db');

// Get all products (Admin)
exports.getAllProducts = async (req, res) => {
    try {
        const [products] = await db.execute('SELECT * FROM products ORDER BY category, name');
        res.render('products/index', {
            user: req.user,
            products,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.render('products/index', { user: req.user, products: [], error: 'Gagal memuat produk' });
    }
};

// Render Add Product Form
exports.getAddProduct = (req, res) => {
    res.render('products/add', { user: req.user, error: null });
};

// Add New Product
exports.postAddProduct = async (req, res) => {
    try {
        const { name, category, price, description } = req.body;

        // Validate input
        if (!name || !category || !price) {
            return res.render('products/add', {
                user: req.user,
                error: 'Nama, kategori, dan harga wajib diisi!'
            });
        }

        // Insert product
        await db.execute(
            'INSERT INTO products (name, category, price, description) VALUES (?, ?, ?, ?)',
            [name, category, parseFloat(price), description || null]
        );

        res.redirect('/products?success=Produk berhasil ditambahkan');
    } catch (error) {
        console.error('Add product error:', error);
        res.render('products/add', { user: req.user, error: 'Gagal menambahkan produk' });
    }
};

// Render Edit Product Form
exports.getEditProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);

        if (products.length === 0) {
            return res.redirect('/products?error=Produk tidak ditemukan');
        }

        res.render('products/edit', { user: req.user, product: products[0], error: null });
    } catch (error) {
        console.error('Get edit product error:', error);
        res.redirect('/products?error=Gagal memuat produk');
    }
};

// Update Product
exports.postEditProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, description } = req.body;

        // Validate input
        if (!name || !category || !price) {
            const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
            return res.render('products/edit', {
                user: req.user,
                product: products[0],
                error: 'Nama, kategori, dan harga wajib diisi!'
            });
        }

        // Update product
        await db.execute(
            'UPDATE products SET name = ?, category = ?, price = ?, description = ? WHERE id = ?',
            [name, category, parseFloat(price), description || null, id]
        );

        res.redirect('/products?success=Produk berhasil diperbarui');
    } catch (error) {
        console.error('Update product error:', error);
        res.redirect('/products?error=Gagal memperbarui produk');
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM products WHERE id = ?', [id]);
        res.redirect('/products?success=Produk berhasil dihapus');
    } catch (error) {
        console.error('Delete product error:', error);
        res.redirect('/products?error=Gagal menghapus produk');
    }
};

// Get products by category (for customer order)
exports.getProductsByCategory = async (req, res) => {
    try {
        const [services] = await db.execute("SELECT * FROM products WHERE category = 'service' ORDER BY price");
        const [foods] = await db.execute("SELECT * FROM products WHERE category = 'food' ORDER BY name");
        const [beverages] = await db.execute("SELECT * FROM products WHERE category = 'beverage' ORDER BY name");

        return { services, foods, beverages };
    } catch (error) {
        console.error('Get products by category error:', error);
        return { services: [], foods: [], beverages: [] };
    }
};
