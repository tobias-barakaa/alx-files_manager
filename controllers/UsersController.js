import { MongoClient, ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

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
      // Check if the user already exists
      const userExists = await dbClient.db.collection('users').findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password
      const hashedPassword = sha1(password);

      // Generate a new ObjectID for the user
      const userId = new ObjectId();

      // Create a new user object
      const newUser = {
        _id: userId,
        email,
        hashedPassword,
      };

      // Insert the new user into the database
      const result = await dbClient.db.collection('users').insertOne(newUser);

      // Return the response with the user ID
      return res.status(201).json({ id: result.insertedId.toHexString(), email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let client;
    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      client = new MongoClient(process.env.DB_HOST || 'localhost', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await client.connect();
      const db = client.db(process.env.DB_DATABASE || 'files_manager');
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ _id: ObjectId(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id.toHexString(), email: user.email });
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      if (client) {
        await client.close();
      }
    }
  }
}

module.exports = UsersController;
export default UsersController;
