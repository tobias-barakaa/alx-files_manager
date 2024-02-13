// controllers/UsersController.js

import { MongoClient, ObjectId } from 'mongodb';
import sha1 from 'sha1';

class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }

        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }

        const client = new MongoClient(process.env.DB_HOST || 'localhost', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        try {
            await client.connect();
            const db = client.db(process.env.DB_DATABASE || 'files_manager');
            const usersCollection = db.collection('users');

            // Check if the user already exists
            const existingUser = await usersCollection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Already exist' });
            }

            // Hash the password
            const hashedPassword = sha1(password);

            // Insert the new user
            const result = await usersCollection.insertOne({
                email,
                password: hashedPassword,
            });

            // Return the newly created user with Mongoid
            return res.status(201).json({ id: result.insertedId.toHexString(), email });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } finally {
            await client.close();
        }
    }
}

export default UsersController;
export { UsersController };
