
const db = require('../config/db');

class PublisherModel {
    static async getAllPublishers() {
        const [rows] = await db.query(`
            SELECT
                publisher_id,
                publisher_name,
                contact_email AS email,
                contact_number,
                address,
                created_at
            FROM publishers
            ORDER BY publisher_name ASC
        `);

        return rows;
    }

    static async getPublisherById(id) {
        const [rows] = await db.query(`
            SELECT
                publisher_id,
                publisher_name,
                contact_email AS email,
                contact_number,
                address,
                created_at
            FROM publishers
            WHERE publisher_id = ?
        `, [id]);

        return rows[0] || null;
    }

    static async createPublisher(data) {
        const [result] = await db.query(
            `INSERT INTO publishers
                (publisher_name, contact_email, contact_number, address)
             VALUES (?, ?, ?, ?)`,
            [
                data.publisher_name,
                data.email || data.contact_email || null,
                data.contact_number || null,
                data.address || null
            ]
        );

        return result.insertId;
    }

    static async updatePublisher(id, data) {
        const [result] = await db.query(
            `UPDATE publishers
             SET publisher_name = ?,
                 contact_email = ?,
                 contact_number = ?,
                 address = ?
             WHERE publisher_id = ?`,
            [
                data.publisher_name,
                data.email || data.contact_email || null,
                data.contact_number || null,
                data.address || null,
                id
            ]
        );

        return result.affectedRows;
    }

    static async deletePublisher(id) {
        const [publishers] = await db.query(
            'SELECT publisher_id FROM publishers WHERE publisher_id = ?',
            [id]
        );

        if (publishers.length === 0) {
            return 0;
        }

        const [books] = await db.query(
            'SELECT COUNT(*) AS total FROM books WHERE publisher_id = ?',
            [id]
        );

        if (Number(books[0].total) > 0) {
            const error = new Error(
                'This publisher is assigned to one or more books and cannot be deleted.'
            );

            error.code = 'PUBLISHER_IN_USE';
            throw error;
        }

        const [result] = await db.query(
            'DELETE FROM publishers WHERE publisher_id = ?',
            [id]
        );

        return result.affectedRows;
    }
}

module.exports = PublisherModel;
