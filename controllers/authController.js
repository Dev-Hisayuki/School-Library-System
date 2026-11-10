
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

const Admin = require('../models/adminModel');
const db = require('../config/db');

const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required.'
                });
            }

            const admin = await Admin.findByUsername(username.trim());

            if (!admin || !admin.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password.'
                });
            }

            const parts = admin.password_hash.split('$');

            if (parts.length !== 3 || parts[0] !== 'scrypt') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password.'
                });
            }

            const [, salt, storedHash] = parts;

            const hashedPassword = await scrypt(
                password,
                salt,
                64
            );

            const storedBuffer = Buffer.from(storedHash, 'hex');

            if (
                storedBuffer.length !== hashedPassword.length ||
                !crypto.timingSafeEqual(storedBuffer, hashedPassword)
            ) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password.'
                });
            }

            await db.execute(
                `INSERT INTO activity_logs (admin_id, action, description)
                 VALUES (?, ?, ?)`,
                [
                    admin.id,
                    'LOGIN',
                    `Administrator ${admin.username} logged in.`
                ]
            );

            return res.status(200).json({
                success: true,
                message: 'Login successful.',
                admin: {
                    id: admin.id,
                    full_name: admin.full_name,
                    username: admin.username,
                    email: admin.email
                }
            });

        } catch (error) {
            console.error('Login error:', error);

            return res.status(500).json({
                success: false,
                message: 'An internal server error occurred.'
            });
        }
    }
};

module.exports = authController;
