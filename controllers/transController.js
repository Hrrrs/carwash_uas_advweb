const db = require('../config/db');

// Customer - Get Order Page
exports.getOrderPage = async (req, res) => {
    try {
        const [foods] = await db.execute("SELECT * FROM products WHERE category = 'food' ORDER BY name");
        const [beverages] = await db.execute("SELECT * FROM products WHERE category = 'beverage' ORDER BY name");

        res.render('order', {
            user: req.user,
            foods,
            beverages,
            error: null,
            success: null
        });
    } catch (error) {
        console.error('Get order page error:', error);
        res.render('order', { user: req.user, foods: [], beverages: [], error: 'Gagal memuat menu' });
    }
};

// Customer - Submit Order
exports.submitOrder = async (req, res) => {
    try {
        const { customerName, policeNumber, items } = req.body;

        // Validate input
        if (!policeNumber) {
            const [foods] = await db.execute("SELECT * FROM products WHERE category = 'food' ORDER BY name");
            const [beverages] = await db.execute("SELECT * FROM products WHERE category = 'beverage' ORDER BY name");
            return res.render('order', {
                user: req.user,
                foods,
                beverages,
                error: 'Nomor Plat kendaraan wajib diisi!',
                success: null
            });
        }

        // Parse items from JSON
        let orderItems = [];
        if (items) {
            try {
                orderItems = JSON.parse(items);
            } catch (e) {
                orderItems = [];
            }
        }

        if (orderItems.length === 0) {
            const [foods] = await db.execute("SELECT * FROM products WHERE category = 'food' ORDER BY name");
            const [beverages] = await db.execute("SELECT * FROM products WHERE category = 'beverage' ORDER BY name");
            return res.render('order', {
                user: req.user,
                foods,
                beverages,
                error: 'Pilih minimal 1 item untuk dipesan!',
                success: null
            });
        }

        // Create transaction
        const [result] = await db.execute(
            'INSERT INTO transactions (customer_name, police_number, status) VALUES (?, ?, ?)',
            [customerName || 'Customer', policeNumber.toUpperCase(), 'pending']
        );

        const transactionId = result.insertId;
        let totalAmount = 0;

        // Insert transaction details
        for (const item of orderItems) {
            const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [item.productId]);
            if (products.length > 0) {
                const product = products[0];
                const subtotal = product.price * item.qty;
                totalAmount += subtotal;

                await db.execute(
                    'INSERT INTO transaction_details (transaction_id, product_id, product_name, price, qty, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                    [transactionId, product.id, product.name, product.price, item.qty, subtotal]
                );
            }
        }

        // Update total amount
        await db.execute('UPDATE transactions SET total_amount = ? WHERE id = ?', [totalAmount, transactionId]);

        const [foods] = await db.execute("SELECT * FROM products WHERE category = 'food' ORDER BY name");
        const [beverages] = await db.execute("SELECT * FROM products WHERE category = 'beverage' ORDER BY name");

        res.render('order', {
            user: req.user,
            foods,
            beverages,
            error: null,
            success: `Pesanan berhasil! Nomor Plat: ${policeNumber.toUpperCase()}. Silakan tunggu pesanan Anda.`
        });

    } catch (error) {
        console.error('Submit order error:', error);
        const [foods] = await db.execute("SELECT * FROM products WHERE category = 'food' ORDER BY name");
        const [beverages] = await db.execute("SELECT * FROM products WHERE category = 'beverage' ORDER BY name");
        res.render('order', {
            user: req.user,
            foods,
            beverages,
            error: 'Gagal membuat pesanan. Silakan coba lagi.',
            success: null
        });
    }
};

// Admin - Get Dashboard (Pending Orders)
exports.getAdminDashboard = async (req, res) => {
    try {
        const [pendingOrders] = await db.execute(
            "SELECT * FROM transactions WHERE status = 'pending' ORDER BY transaction_date DESC"
        );

        res.render('dashboard', {
            user: req.user,
            pendingOrders,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Get admin dashboard error:', error);
        res.render('dashboard', { user: req.user, pendingOrders: [], error: 'Gagal memuat data' });
    }
};

// Admin - Get POS (Transaction Detail)
exports.getPOS = async (req, res) => {
    try {
        const { id } = req.params;

        // Get transaction
        const [transactions] = await db.execute('SELECT * FROM transactions WHERE id = ?', [id]);
        if (transactions.length === 0) {
            return res.redirect('/admin/dashboard?error=Transaksi tidak ditemukan');
        }

        const transaction = transactions[0];

        // Get transaction details
        const [details] = await db.execute('SELECT * FROM transaction_details WHERE transaction_id = ?', [id]);

        // Get all services for dropdown
        const [services] = await db.execute("SELECT * FROM products WHERE category = 'service' ORDER BY name");

        res.render('pos', {
            user: req.user,
            transaction,
            details,
            services,
            error: null
        });
    } catch (error) {
        console.error('Get POS error:', error);
        res.redirect('/admin/dashboard?error=Gagal memuat transaksi');
    }
};

// Admin - Add Service to Transaction
exports.addService = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId, qty } = req.body;

        // Get product
        const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
        if (products.length === 0) {
            return res.redirect(`/admin/pos/${id}?error=Layanan tidak ditemukan`);
        }

        const product = products[0];
        const subtotal = product.price * (parseInt(qty) || 1);

        // Insert transaction detail
        await db.execute(
            'INSERT INTO transaction_details (transaction_id, product_id, product_name, price, qty, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
            [id, product.id, product.name, product.price, parseInt(qty) || 1, subtotal]
        );

        // Update transaction total
        const [totals] = await db.execute('SELECT SUM(subtotal) as total FROM transaction_details WHERE transaction_id = ?', [id]);
        const newTotal = totals[0].total || 0;
        await db.execute('UPDATE transactions SET total_amount = ? WHERE id = ?', [newTotal, id]);

        res.redirect(`/admin/pos/${id}`);
    } catch (error) {
        console.error('Add service error:', error);
        res.redirect(`/admin/pos/${req.params.id}?error=Gagal menambahkan layanan`);
    }
};

// Admin - Process Payment (Mark as Paid)
exports.processPayment = async (req, res) => {
    try {
        const { id } = req.params;

        // Update status to paid
        await db.execute("UPDATE transactions SET status = 'paid' WHERE id = ?", [id]);

        res.redirect('/admin/dashboard?success=Pembayaran berhasil diproses!');
    } catch (error) {
        console.error('Process payment error:', error);
        res.redirect('/admin/dashboard?error=Gagal memproses pembayaran');
    }
};

// Admin - Delete Item from Transaction
exports.deleteItem = async (req, res) => {
    try {
        const { transId, itemId } = req.params;

        // Delete item
        await db.execute('DELETE FROM transaction_details WHERE id = ? AND transaction_id = ?', [itemId, transId]);

        // Update transaction total
        const [totals] = await db.execute('SELECT SUM(subtotal) as total FROM transaction_details WHERE transaction_id = ?', [transId]);
        const newTotal = totals[0].total || 0;
        await db.execute('UPDATE transactions SET total_amount = ? WHERE id = ?', [newTotal, transId]);

        res.redirect(`/admin/pos/${transId}`);
    } catch (error) {
        console.error('Delete item error:', error);
        res.redirect(`/admin/pos/${req.params.transId}?error=Gagal menghapus item`);
    }
};
