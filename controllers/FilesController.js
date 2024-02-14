// controllers/FilesController.js

import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import Bull from 'bull';

const fileQueue = new Bull('fileQueue');

const FilesController = {
    async postUpload(req, res) {
        const { id } = req.userId;
        const {
        name, type, parentId, isPublic, data,
        } = req.body;
    
        if (!name) {
        return res.status(400).json({ error: 'Missing name' });
        }
    
        if (!type) {
        return res.status(400).json({ error: 'Missing type' });
        }
    
        const validTypes = ['folder', 'file', 'image'];
        if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid type' });
        }
    
        if (parentId && !ObjectId.isValid(parentId)) {
        return res.status(400).json({ error: 'parentId is not a valid ObjectID' });
        }
    
        if (isPublic && typeof isPublic !== 'boolean') {
        return res.status(400).json({ error: 'isPublic is not a boolean' });
        }
    
        if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
        }
    
        if (type === 'folder') {
        const newFolder = {
            userId: id,
            name,
            type,
            parentId: parentId || null,
            isPublic: isPublic || false,
        };
        const result = await dbClient.files.insertOne(newFolder);
        return res.status(201).json({
            id: result.insertedId,
            userId: id,
            name,
            type,
            parentId: parentId || null,
            isPublic: isPublic || false,
        });
        }
    
        const buff = Buffer.from(data, 'base64');
        const filePath = path.join(__dirname, '../../tmp', `${sha1(buff)}.${mime.extension(type)}`);
        await fs.promises.writeFile(filePath, buff);
    
        const newFile = {
        userId: id,
        name,
        type,
        parentId: parentId || null,
        isPublic: isPublic || false,
        localPath: filePath,
        };
        const result = await dbClient.files.insertOne(newFile);
        fileQueue.add({ userId: id, fileId: result.insertedId });
    
        return res.status(201).json({
        id: result.insertedId,
        userId: id,
        name,
        type,
        parentId: parentId || null,
        isPublic: isPublic || false,
        });
    },
    
    async getShow(req, res) {
        const { id } = req.userId;
        const { fileId } = req.params;
    
        if (!ObjectId.isValid(fileId)) {
        return res.status(404).json({ error: 'Not found' });
        }
    
        const file = await dbClient.files.findOne({ _id: ObjectId(fileId), userId: ObjectId(id) });
    
        if (!file) {
        return res.status(404).json({ error: 'Not found' });
        }
    
        return res.status(200).json(file);
    }
};

export default FilesController;
