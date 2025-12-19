const db = require('../config/db');

// Get Financial Report
exports.getReport = async (req, res) => {
    try {
        const { date } = req.query;
        let filterDate = date || null;

        // Summary Cards Data
        // 1. Pendapatan Hari Ini
        const [todayRevenue] = await db.execute(
            "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM transactions WHERE status = 'paid' AND DATE(transaction_date) = CURDATE()"
        );

        // 2. Transaksi Hari Ini
        const [todayCount] = await db.execute(
            "SELECT COUNT(id) as count FROM transactions WHERE status = 'paid' AND DATE(transaction_date) = CURDATE()"
        );

        // 3. Total Pendapatan (All Time)
        const [allTimeRevenue] = await db.execute(
            "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM transactions WHERE status = 'paid'"
        );

        // Transaction History
        let query = "SELECT * FROM transactions WHERE status = 'paid'";
        let params = [];

        if (filterDate) {
            query += " AND DATE(transaction_date) = ?";
            params.push(filterDate);
        }

        query += " ORDER BY transaction_date DESC";

        const [transactions] = await db.execute(query, params);

        res.render('report', {
            user: req.user,
            summary: {
                todayRevenue: todayRevenue[0].revenue,
                todayCount: todayCount[0].count,
                allTimeRevenue: allTimeRevenue[0].revenue
            },
            transactions,
            filterDate
        });

    } catch (error) {
        console.error('Get report error:', error);
        res.render('report', {
            user: req.user,
            summary: { todayRevenue: 0, todayCount: 0, allTimeRevenue: 0 },
            transactions: [],
            filterDate: null,
            error: 'Gagal memuat laporan'
        });
    }
};
