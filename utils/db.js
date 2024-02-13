// file 'db.js'
import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.DB_HOST = 'localhost';
    this.DB_PORT = 27017;
    this.DB_DATABASE = 'files_manager';
    this.client = new MongoClient(`mongodb://${this.DB_HOST}:${this.DB_PORT}`, { useUnifiedTopology: true });
  }

  isAlive() {
    return this.client.connect();
  }

  async nbUsers() {
    try {
      const data = await this.client.db(this.DB_DATABASE).collection('users').find().toArray();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async nbFiles() {
    return this.client.db(this.DB_DATABASE).collection('files').countDocuments();
  }
}

const mongoClient = new DBClient();

export default mongoClient;
