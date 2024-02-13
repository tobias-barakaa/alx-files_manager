// controllers/UsersController.js
import sha1 from 'sha1';
import dbClient from '../utils/db';

const UsersController = {
  async postNew(req, res) {
    // receive data from the client
    const { email, password } = req.body;
    // check if the email and password are provided
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });
    // loop inside database and find if the email already exists
    const user = await dbClient.usersCollection.findOne({ email });
    // if the email already exists return an error "Already exist"
    if (user) return res.status(400).json({ error: 'Already exist' });
    // if the email is not found add one to the collection with password hashed
    const result = await dbClient.usersCollection.insertOne({
      email,
      password: sha1(password),
    });
    // return the email and password hashed
    return res.status(201).json({
      email,
      password: result.ops[0].password,
    });
  },
};

module.exports = UsersController;
export default UsersController;
