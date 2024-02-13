const { hash } = require('crypto');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const existingUser = await dbClient.db().collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = hash('sha1', password).toString('hex'); // SHA1 hashing
    const newUser = { email, password: hashedPassword };

    try {
      const result = await dbClient.db().collection('users').insertOne(newUser);
      const { insertedId } = result;
      return res.status(201).json({ id: insertedId, email }); // Return only ID and email
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UsersController;
