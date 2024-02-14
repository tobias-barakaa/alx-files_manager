import { ObjectId } from 'mongodb';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  async postUpload(req, res) {
    const token = req.header('X-Token');
    const { name } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { file } = req;
    const filePath = `${FOLDER_PATH}/${uuidv4()}`;
    const fileData = {
      userId: user._id,
      name,
      type: file.mimetype,
      path: filePath,
    };
    fs.writeFile(filePath, file.buffer, async (error) => {
      if (error) {
        return res.status(500).json({ error: 'Error reading file' });
      }

      await dbClient.db.collection('files').insertOne(fileData);
      return res.status(201).json({
        id: fileData._id, userId: fileData.userId, name: fileData.name, type: fileData.type,
      });
    });

    // Add a default return statement
    return null;
  },
};

module.exports = FilesController;
