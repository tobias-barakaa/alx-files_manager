/* eslint-disable import/no-named-as-default */

// Importing Redis and database clients
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

// Exporting AppController class with static methods
export default class AppController {
  // Returns the status of the Redis and database clients
  static getStatus(req, res) {
    res.status(200).json({
      redis: redisClient.isAlive(), // Checks if Redis client is alive
      db: dbClient.isAlive(), // Checks if database client is alive
    });
  }

  // Returns the number of users and files in the database
  static getStats(req, res) {
    // Using Promise.all to asynchronously get the number of users and files
    Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
      .then(([usersCount, filesCount]) => {
        res.status(200).json({ users: usersCount, files: filesCount });
      });
  }
}
