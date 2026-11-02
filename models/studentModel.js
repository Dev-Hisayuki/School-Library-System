const db = require('../config/db');

const getAllStudents = async (search = '') => {
    const keyword = `%${search}%`;

    const [rows] = await db.query(
        `SELECT
            s.student_id,
            s.student_number,
            s.student_name,
            s.email,
            s.course,
            s.year_level,
            s.contact_number,
            s.created_at,
            CASE
                WHEN b.borrower_id IS NULL THEN 0
                ELSE 1
            END AS is_borrower
         FROM students s
         LEFT JOIN borrowers b ON s.student_id = b.student_id
         WHERE s.student_number LIKE ?
            OR s.student_name LIKE ?
            OR COALESCE(s.email, '') LIKE ?
            OR COALESCE(s.course, '') LIKE ?
         ORDER BY s.student_id DESC`,
        [keyword, keyword, keyword, keyword]
    );

    return rows;
};

const getStudentById = async (studentId) => {
    const [rows] = await db.query(
        'SELECT * FROM students WHERE student_id = ?',
        [studentId]
    );

    return rows[0] || null;
};

const createStudent = async (student) => {
    const {
        student_number,
        student_name,
        email,
        course,
        year_level,
        contact_number
    } = student;

    const [result] = await db.query(
        `INSERT INTO students
            (student_number, student_name, email, course, year_level, contact_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            student_number,
            student_name,
            email || null,
            course || null,
            year_level || null,
            contact_number || null
        ]
    );

    return result.insertId;
};

const updateStudent = async (studentId, student) => {
    const {
        student_number,
        student_name,
        email,
        course,
        year_level,
        contact_number
    } = student;

    const [result] = await db.query(
        `UPDATE students
         SET student_number = ?,
             student_name = ?,
             email = ?,
             course = ?,
             year_level = ?,
             contact_number = ?
         WHERE student_id = ?`,
        [
            student_number,
            student_name,
            email || null,
            course || null,
            year_level || null,
            contact_number || null,
            studentId
        ]
    );

    return result.affectedRows;
};

const deleteStudent = async (studentId) => {
    const [result] = await db.query(
        'DELETE FROM students WHERE student_id = ?',
        [studentId]
    );

    return result.affectedRows;
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};