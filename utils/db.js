// file 'db.js'
import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.DB_HOST = 'localhost';
    this.DB_PORT = 27017;
    this.DB_DATABASE = 'files_manager';
    this.client = new MongoClient(`mongodb://${this.DB_HOST}:${this.DB_PORT}`, { useUnifiedTopology: true });
  }

  async isAlive() {
    try {
      await this.client.connect();
      console.log('Connection to DB established');
      return true;
    } catch (error) {
      console.error('Connection to DB failed:', error);
      return false;
    }
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
    try {
      const files = this.client.db(this.DB_DATABASE).collection('files').countDocuments();
      return files;
    } catch (error) {
      throw new Error(error);
    }
  }
}

const mongoClient = new DBClient();

export default mongoClient;
