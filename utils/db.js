const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = 'localhost';
    const port = 27017;
    const database = 'files_manager';

    this.client = new MongoClient(`mongodb://${host}:${port}/${database}`);
    this.db = null;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db();
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      throw err;
    }
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    if (!this.db) await this.connect();
    const usersCollection = this.db.collection('users');
    const count = await usersCollection.countDocuments();
    return count;
  }

  async nbFiles() {
    if (!this.db) await this.connect();
    const filesCollection = this.db.collection('files');
    const count = await filesCollection.countDocuments();
    return count;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
