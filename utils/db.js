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
    this.client.connect();
  }

  async nbUsers() {
    return this.client.db(this.DB_DATABASE).collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db(this.DB_DATABASE).collection('files').countDocuments();
  }
}

const mongoClient = new DBClient();

export default mongoClient;
