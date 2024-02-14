/* eslint-disable */
import { ObjectId } from 'mongodb';
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dbClient from '../utils/db';

const FilesController = {
  async postUpload(req, res) {
    const { userId } = req;
    const { name } = req.body;
    const { type } = req.body;
    const { parentId } = req.body;
    const { isPublic } = req.body;
    const { data } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (type !== 'folder' && type !== 'file') {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (parentId) {
      const parent = await dbClient.filesCollection.findOne({ _id: ObjectId(parentId) });

      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    if (type === 'file') {
      const buff = Buffer.from(data, 'base64');
      const filePath = path.join(process.env.FOLDER_PATH, uuidv4());
      await writeFileSync(filePath, buff);
    }

    const doc = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    };

    const result = await dbClient.filesCollection.insertOne(doc);

    return res.status(201).json({
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    });
  },

  async getShow(req, res) {
    const { userId } = req;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.filesCollection.findOne({ _id: ObjectId(id) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.userId.toString() !== userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  },
};

export default FilesController;
