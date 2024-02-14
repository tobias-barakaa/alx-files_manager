import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  postUpload: async (req, res) => {
    const { token } = req.headers;

    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      const parentFile = parentId !== '0' ? await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) }) : null;
      if (parentId !== '0' && (!parentFile || parentFile.type !== 'folder')) {
        return res.status(400).json({ error: 'Parent not found or not a folder' });
      }

      const fileData = {
        userId,
        name,
        type,
        isPublic,
        parentId,
      };

      if (type === 'folder') {
        const result = await dbClient.db.collection('files').insertOne(fileData);
        return res.status(201).json({ ...fileData, id: result.insertedId });
      }

      // For file and image types
      const fileExtension = type === 'image' ? 'png' : 'txt';
      const filePath = path.join(FOLDER_PATH, `${uuidv4()}.${fileExtension}`);

      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

      const result = await dbClient.db.collection('files').insertOne({ ...fileData, localPath: filePath });
      return res.status(201).json({ ...fileData, id: result.insertedId });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default FilesController;
