import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const getStatus = (req, res) => {
  if (redisClient.isAlive()) {
    res.status(200).send({ redis: true, db: true });
  } else {
    res.status(500).send('Redis client is not connected to the server');
  }
};

const getStats = (req, res) => {
  const stats = {
    users: dbClient.nbUsers(),
    files: dbClient.nbFiles(),
  };
  res.status(200).send({ users: stats.users, files: stats.files });
};

const controllerfunctions = {
  getStatus,
  getStats,
};

module.exports = controllerfunctions;
export default controllerfunctions;
