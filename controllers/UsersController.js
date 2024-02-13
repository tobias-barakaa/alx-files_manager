// controllers/UsersController.js
import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }

        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }

        try {
            const userExists = await dbClient.getUser(email);
            if (userExists) {
                return res.status(400).json({ error: 'Already exist' });
            }

            const hashedPassword = sha1(password);

            const newUser = {
                email,
                password: hashedPassword,
            };

            const insertedUser = await dbClient.createUser(newUser);

            return res.status(201).json({ id: insertedUser._id, email: insertedUser.email });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default UsersController;
