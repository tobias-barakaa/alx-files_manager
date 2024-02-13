// utils/db.js

import { MongoClient } from 'mongodb';

class DBClient {
    constructor() {
        this.DB_HOST = 'localhost';
        this.DB_PORT = 27017;
        this.DB_DATABASE = 'files_manager';
        this.client = new MongoClient(`mongodb://${this.DB_HOST}:${this.DB_PORT}`);
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
            const count = await this.client.db(this.DB_DATABASE).collection('users').countDocuments();
            return count;
        } catch (error) {
            console.error('Error counting users:', error);
            throw error;
        }
    }

    async nbFiles() {
        try {
            const count = await this.client.db(this.DB_DATABASE).collection('files').countDocuments();
            return count;
        } catch (error) {
            console.error('Error counting files:', error);
            throw error;
        }
    }
}

const dbClient = new DBClient();

export default dbClient;
