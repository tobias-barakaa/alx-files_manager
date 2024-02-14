/* eslint-disable */

import Queue from 'bull';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuidv4';
import { mkdir, writeFile, readFileSync } from 'fs';
import mime from 'mime-types';
import dbClient from '../utils/db';
import { getIdAndKey, isValidUser } from '../utils/users';

// nothing here yet, just trying to see where's the problm
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
        if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
        }
        if (type !== 'folder' && !mime.lookup(name)) {
        return res.status(400).json({ error: 'Invalid data' });
        }
        if (parentId) {
        const parentFile = await dbClient.files.findOne({ _id: ObjectId(parentId) });
        if (!parentFile || parentFile.type !== 'folder') {
            return res.status(400).json({ error: 'Parent not found' });
        }
        }
        const fileData = {
        userId: ObjectId(userId),
        name,
        type,
        parentId: parentId || null,
        isPublic: isPublic || false,
        };
        if (type === 'folder') {
        fileData.localPath = null;
        } else {
        const folder = await dbClient.files.findOne({ _id: ObjectId(parentId) });
        const folderPath = folder.localPath || folder.name;
        const filePath = path.join(folderPath, name);
        fileData.localPath = filePath;
        fileData.mimeType = mime.lookup(name);
        fileData.isPublic = false;
        fileData.status = 'available';
        fileData.size = data.length;
        try {
            await fs.promises.writeFile(filePath, data, 'base64');
        } catch (error) {
            return res.status(400).json({ error: 'Cannot write file' });
        }
        }
        const result = await dbClient.files.insertOne(fileData);
        return res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        parentId,
        isPublic: isPublic || false,
        });
    },
    async getShow(req, res) {
        const { id } = req.params;
        const file = await dbClient.files.findOne({ _id: ObjectId(id) });
        if (!file) {
        return res.status(404).json({ error: 'Not found' });
        }
        return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        parentId: file.parentId || null,
        isPublic: file.isPublic,
        });
    },
    async index(req, res) {
        const { parentId } = req.query;
        const files = await dbClient.files.find({ parentId: parentId || null }).toArray();
        return res.status(200).json(files);
    },
    async destroy(req, res) {
        const { id } = req.params;
        const file = await dbClient.files.findOne({ _id: ObjectId(id) });
        if (!file) {
        return res.status(404).json({ error: 'Not found' });
        }
        if (file.type !== 'folder') {
        try {
            await fs.promises.unlink(file.localPath);
        } catch (error) {
            return res.status(400).json({ error: 'Cannot delete file' });
        }
        }
        await dbClient.files.deleteOne({ _id: ObjectId(id) });
        return res.status(204).end();
    },
};

export default FilesController;
