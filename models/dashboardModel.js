const db = require('../config/db');



async function getLowStockThreshold() {
    const [rows] = await db.execute(
        `SELECT setting_value
         FROM system_settings
         WHERE setting_key = 'low_stock_threshold'
         LIMIT 1`
    );

    const threshold = Number(rows[0]?.setting_value);

    return Number.isFinite(threshold) && threshold >= 0
        ? threshold
        : 5;
}



exports.getStatistics = async () => {
    const threshold = await getLowStockThreshold();

    const [rows] = await db.execute(
        `SELECT
            (SELECT COUNT(*)
             FROM books) AS total_titles,

            (SELECT COALESCE(SUM(total_copies), 0)
             FROM books) AS total_copies,

            (SELECT COALESCE(SUM(available_copies), 0)
             FROM books) AS available_copies,

            (SELECT COALESCE(SUM(bd.quantity), 0)
             FROM borrow_records br
             INNER JOIN borrow_details bd
                ON br.borrow_id = bd.borrow_id
             WHERE br.return_date IS NULL
               AND br.status IN ('Borrowed', 'Overdue')
            ) AS active_borrowed,

            (SELECT COALESCE(SUM(bd.quantity), 0)
             FROM borrow_records br
             INNER JOIN borrow_details bd
                ON br.borrow_id = bd.borrow_id
             WHERE br.return_date IS NULL
               AND br.status IN ('Borrowed', 'Overdue')
               AND br.due_date = CURDATE()
            ) AS due_today,

            (SELECT COALESCE(SUM(bd.quantity), 0)
             FROM borrow_records br
             INNER JOIN borrow_details bd
                ON br.borrow_id = bd.borrow_id
             WHERE br.return_date IS NULL
               AND br.status IN ('Borrowed', 'Overdue')
               AND (
                   br.status = 'Overdue'
                   OR br.due_date < CURDATE()
               )
            ) AS overdue,

            (SELECT COUNT(*)
             FROM books
             WHERE available_copies <= ?
            ) AS low_stock_books,

            (SELECT COALESCE(SUM(quantity_returned), 0)
             FROM return_details
             WHERE item_condition = 'Damaged'
            ) AS damaged_copies,

            (SELECT COALESCE(SUM(quantity_returned), 0)
             FROM return_details
             WHERE item_condition = 'Lost'
            ) AS lost_copies`,
        [threshold]
    );

    const result = rows[0];

    return {
        books: {
            total_titles: Number(result.total_titles),
            total_copies: Number(result.total_copies),
            available_copies: Number(result.available_copies)
        },

        borrowing: {
            active_borrowed: Number(result.active_borrowed),
            due_today: Number(result.due_today),
            overdue: Number(result.overdue)
        },

        stock: {
            low_stock_books: Number(result.low_stock_books),
            low_stock_threshold: threshold
        },

        conditions: {
            damaged_copies: Number(result.damaged_copies),
            lost_copies: Number(result.lost_copies)
        }
    };
};


exports.getCategoryDistribution = async () => {
    const [rows] = await db.execute(
        `SELECT
            c.category_name,
            COUNT(b.book_id) AS total_titles
         FROM categories c
         LEFT JOIN books b
            ON c.category_id = b.category_id
         GROUP BY c.category_id, c.category_name
         ORDER BY total_titles DESC`
    );

    return rows;
};


exports.getRecentActivity = async () => {
    const [rows] = await db.execute(
        `SELECT
            al.action,
            al.description,
            al.created_at,
            COALESCE(a.full_name, a.username, 'System') AS admin_name
         FROM activity_logs al
         LEFT JOIN admins a
            ON al.admin_id = a.id
         ORDER BY al.created_at DESC
         LIMIT 10`
    );

    return rows;
};


exports.getLowStockBooks = async () => {
    const threshold = await getLowStockThreshold();

    const [rows] = await db.execute(
        `SELECT
            title,
            total_copies,
            available_copies
         FROM books
         WHERE available_copies <= ?
         ORDER BY available_copies ASC, title ASC
         LIMIT 10`,
        [threshold]
    );

    return rows;
};