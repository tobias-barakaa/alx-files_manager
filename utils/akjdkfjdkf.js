import MongoClient from 'mongodb';

class DBClient {
  constructor() {
    this.url = 'mongodb://localhost:27017';
    this.client = new MongoClient(this.url);
  }
  
}

const dbClient = new DBClient();