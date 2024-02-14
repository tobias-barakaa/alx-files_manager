import { ObjectId } from 'mongodb';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
    async postUpload(req, res) {
        const { userId } = req;
        const { name } = req.body;
        const { type, data } = req.file;
    
        if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
        }
    
        if (!name) {
        return res.status(400).json({ error: 'Missing name' });
        }
    
        if (!type || !data) {
        return res.status(400).json({ error: 'Missing type or data' });
        }
    
        if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
        }
    
        const filePath = `${FOLDER_PATH}/${uuidv4()}`;
        fs.writeFile(filePath, data, async (error) => {
        if (error) {
            return res.status(500).json({ error: 'Error creating the file' });
        }
    
        const file = {
            userId: ObjectId(userId),
            name,
            type,
            isPublic: false,
            status: 'Available',
            createdDate: new Date(),
            updatedDate: new Date(),
        };
    
        const result = await dbClient.db.collection('files').insertOne(file);
    
        return res.status(201).json({
            id: result.insertedId,
            userId,
            name,
            type,
            isPublic: false,
            status: 'Available',
        });
        });
    },
    
    async getShow(req, res) {
        const { fileId } = req.params;
        const { userId } = req;
    
        if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
        }
    
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
    
        if (!file) {
        return res.status(404).json({ error: 'Not found' });
        }
    
        if (file.status === 'Available' || (file.status === 'Public' && file.isPublic)) {
        return res.status(200).json({
            id: file._id,
            userId: file.userId,
            name: file.name,
            type: file.type,
            isPublic: file.isPublic,
        });
        }
    
        return res.status(403).json({ error: 'Forbidden' });
    },
    
    async getIndex(req, res) {
        const { userId } = req;
    
        if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
        }

        const files = await dbClient.db.collection('files').find({ userId: ObjectId(userId) }).toArray();
        return res.status(200).json(files);
    }
};

module.exports = FilesController;
