import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const postUpload = async (req, res) => {
    const token = req.header('X-Token');
    const { name } = req.body;
    const { type, data } = req.body;
    const user = await redisClient.get(`auth_${token}`);
    
    if (!user) {
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
    
    if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
    }
    
    const filePath = path.join(FOLDER_PATH, uuidv4());
    const buff = Buffer.from(data, 'base64');
    
    fs.writeFile(filePath, buff, 'base64', async (error) => {
        if (error) {
        return res.status(500).json({ error: 'Cannot create the file' });
        }
    
        const result = await dbClient.db.collection('files').insertOne({ userId: ObjectId(user), name, type, path: filePath });
    
        return res.status(201).json({ id: result.insertedId, name, type });
    });
    };

const getShow = async (req, res) => {
    const token = req.header('X-Token');
    const fileId = req.params.id;
    const user = await redisClient.get(`auth_${token}`);
    
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(user) });
    
    if (!file) {
        return res.status(404).json({ error: 'Not found' });
    }
    
    return res.status(200).json({ id: file._id, userId: file.userId, name: file.name, type: file.type });
    }

const index = async (req, res) => {
    const token = req.header('X-Token');
    const user = await redisClient.get(`auth_${token}`);
    
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const files = await dbClient.db.collection('files').find({ userId: ObjectId(user) }).toArray();
    
    return res.status(200).json(files);
    }

const destroy = async (req, res) => {
    const token = req.header('X-Token');
    const fileId = req.params.id;
    const user = await redisClient.get(`auth_${token}`);
    
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(user) });
    
    if (!file) {
        return res.status(404).json({ error: 'Not found' });
    }
    
    fs.unlink(file.path, async (error) => {
        if (error) {
        return res.status(500).json({ error: 'Cannot delete the file' });
        }
    
        await dbClient.db.collection('files').deleteOne({ _id: ObjectId(fileId) });
    
        return res.status(204).end();
    });
    }

export default {
    postUpload,
    getShow,
    index,
    destroy,
};
