import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const UserController = {
  postNew: async (req, res) => {
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
        password: hashedPassword,
      });

      return res.status(201).json({ id: result.insertedId, email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getMe: async (req, res) => {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.db.collection('users').findOne({ _id: dbClient.ObjectId(userId) }, { projection: { email: 1, _id: 1 } });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.json(user);
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default UserController;
