const db = require('../config/db');


const getAllBorrowers = async () => {
    const [rows] = await db.query(`
        SELECT
            b.borrower_id,
            b.student_id,
            s.student_number,
            s.student_name,
            s.course,
            s.year_level
        FROM borrowers b
        INNER JOIN students s
            ON b.student_id = s.student_id
        ORDER BY b.borrower_id DESC
    `);

    return rows;
};


const createBorrower = async (studentId) => {
    const [result] = await db.query(
        'INSERT INTO borrowers (student_id) VALUES (?)',
        [studentId]
    );

    return result.insertId;
};

module.exports = {
    getAllBorrowers,
    createBorrower
};