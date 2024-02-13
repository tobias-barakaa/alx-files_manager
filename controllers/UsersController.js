// controllers/UsersController.js
import sha1 from 'sha1';
import dbClient from '../utils/db';

const UsersController = {
  async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }
      const userExists = await dbClient.getUserByEmail(email);
      if (userExists) {
        return res.status(400).json({ error: 'Already exists' });
      }
      const hashedPassword = sha1(password);

      const newUser = {
        email,
        password: hashedPassword,
      };
      const insertedUser = await dbClient.createUser(newUser);

      const { _id } = insertedUser;
      const responseUser = { id: _id, email };

      return res.status(201).json(responseUser);
    } catch (error) {
      console.error('Error creating new user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = UsersController;
export default UsersController;
