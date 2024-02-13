// controllers/AuthController.js

import { v4 as uuidv4 } from 'uuid';
import { MongoClient } from 'mongodb';
import sha1 from 'sha1';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const email = credentials[0];
    const password = credentials[1];

    const client = new MongoClient(process.env.DB_HOST || 'localhost', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await client.connect();
      const db = client.db(process.env.DB_DATABASE || 'files_manager');
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ email, password: sha1(password) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 'EX', 86400);

      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error connecting user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await client.close();
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await redisClient.del(`auth_${token}`);
      return res.status(204).send();
    } catch (error) {
      console.error('Error disconnecting user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;
