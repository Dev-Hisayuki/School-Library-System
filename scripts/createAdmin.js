const db = require('../config/db');
const crypto = require('crypto');
const { promisify } = require('util');
const readline = require('readline');

const scrypt = promisify(crypto.scrypt);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createAdmin() {
    try {
        const [existing] = await db.execute(
            'SELECT id FROM admins WHERE username = ?',
            ['admin']
        );

        if (existing.length > 0) {
            console.log('Admin account already exists.');
            return;
        }

        rl.question('Enter your new admin password: ', async (password) => {
            try {
                if (password.length < 12) {
                    console.log('Password must be at least 12 characters.');
                    return;
                }

                const salt = crypto.randomBytes(16).toString('hex');
                const hash = await scrypt(password, salt, 64);
                const passwordHash =
                    `scrypt$${salt}$${hash.toString('hex')}`;

                await db.execute(
                    `INSERT INTO admins
                    (full_name, username, email, password_hash, is_active)
                    VALUES (?, ?, ?, ?, TRUE)`,
                    [
                        'Administrator',
                        'admin',
                        'Administrator@gmail.com',
                        passwordHash
                    ]
                );

                console.log('Admin account created successfully!');
                console.log('Username: admin');
            } catch (error) {
                console.error('Error:', error.message);
            } finally {
                rl.close();
                await db.end();
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
        rl.close();
        await db.end();
    }
}

createAdmin();