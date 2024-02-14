// controllers/FilesController.js

import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FilesController = {
  async postUpload(req, res) {
    const { 'x-token': token } = req.headers;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
        }

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (parentId !== '0') {
            const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
            if (!parentFile) {
                return res.status(400).json({ error: 'Parent not found' });
            }
            if (parentFile.type !== 'folder') {
                return res.status(400).json({ error: 'Parent is not a folder' });
            }
        }

        const fileData = {
            userId: ObjectId(userId),
            name,
            type,
            parentId: ObjectId(parentId),
            isPublic,
        };

        if (type === 'folder') {
            const result = await dbClient.db.collection('files').insertOne(fileData);
            return res.status(201).json({
                id: result.insertedId,
                userId,
                name,
                type,
                isPublic,
                parentId,
            });
        }

        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const filePath = path.join(folderPath, `${sha1(name)}`);

        try {
            await fs.promises.writeFile(filePath, Buffer.from(data, 'base64'));
        } catch (error) {
            console.error('Error writing file:', error);
            return res.status(400).json({ error: 'Cannot write file' });
        }

        const mimeType = mime.lookup(name);

        const result = await dbClient.db.collection('files').insertOne({
            ...fileData,
            localPath: filePath,
            mimeType,
            status: 'available',
            size: data.length,
        });

        return res.status(201).json({
            id: result.insertedId,
            userId,
            name,
            type,
            isPublic,
            parentId,
        });
    },
};

export default FilesController;
