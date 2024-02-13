// controllers/UsersController.js

import dbClient from '../utils/db';
import sha1 from 'sha1';

const postNew = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
        return res.status(400).json({ error: 'Missing password' });
    }

    try {
        const existingUser = await dbClient.db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Already exist' });
        }

        const hashedPassword = sha1(password);

        const result = await dbClient.db.collection('users').insertOne({
            email,
            hashedPassword,
        });

        return res.status(201).json({ id: result.insertedId.toHexString(), email });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default postNew;
