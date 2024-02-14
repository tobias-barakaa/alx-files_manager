const sha1 = require('sha1');
const db = require('../utils/db');

async function postNew(req, res) {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  // Check if email already exists in DB
  const existingUser = await db.collection('users').findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Already exist' });
  }

  // Hash the password using SHA1
  const hashedPassword = sha1(password);

  // Insert the new user into the database
  const result = await db.collection('users').insertOne({
    email,
    password: hashedPassword,
  });

  // Return the new user's email and auto-generated _id with status code 201
  const newUser = {
    id: result.insertedId,
    email,
  };
  return res.status(201).json(newUser);
}

module.exports = {
  postNew,
};
