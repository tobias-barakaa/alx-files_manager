/* eslint-disable */
import { ObjectId } from 'mongodb';
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dbClient from '../utils/db';

class FilesController {
    static async postUpload(req, res) {
        const { name, type, parentId } = req.body;
        const { data } = req;
        if (!name) return res.status(400).json({ error: 'Missing name' });
        if (!type) return res.status(400).json({ error: 'Missing type' });
        if (!data) return res.status(400).json({ error: 'Missing data' });
        if (type !== 'folder' && !parentId) return res.status(400).json({ error: 'Missing parentId' });
        if (type !== 'folder') {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
        if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
        }
        const file = {
        userId: req.userId,
        name,
        type,
        parentId: parentId || 0,
        };
        const result = await dbClient.db.collection('files').insertOne(file);
        const filePath = path.join(__dirname, '..', process.env.FOLDER_PATH, result.insertedId);
        writeFileSync(filePath, data);
        return res.status(201).json({
        id: result.insertedId,
        userId: req.userId,
        name,
        type,
        parentId: parentId || 0,
        });
    }
    
    static async getShow(req, res) {
        const { id } = req.params;
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        parentId: file.parentId,
        });
    }

    static async getIndex(req, res) {
        const { parentId } = req.query;
        const query = parentId ? { parentId } : { parentId: 0 };
        const files = await dbClient.db.collection('files').find(query).toArray();
        return res.status(200).json(files);
    }

    static async putPublish(req, res) {
        const { id } = req.params;
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Not found' });
        await dbClient.db.collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isPublic: true } });
        return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: true,
        parentId: file.parentId,
        });
    }

    static async putUnpublish(req, res) {
        const { id } = req.params;
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Not found' });
        await dbClient.db.collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isPublic: false } });
        return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: false,
        parentId: file.parentId,
        });
    }

    static async postPublish(req, res) {
        const { id } = req.params;
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Not found' });
        const token = uuidv4();
        await dbClient.db.collection('files').updateOne({ _id: ObjectId(id) }, { $set: { token } });
        return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
        token,
        });
    }

    static async putUnpublish(req, res) {
        const { id } = req.params;
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Not found' });
        await dbClient.db.collection('files').updateOne({ _id: ObjectId(id) }, { $set: { token: null } });
        return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
        });
    }

    static async putStar(req, res) {
        const { id } = req.params;
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Not found' });
        await dbClient.db.collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isStarred: true } });
        return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
        isStarred: true,
        });
    }

    static async putUnstar(req, res) {
        const { id } = req.params;
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Not found' });
        await dbClient.db.collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isStarred: false } });
        return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
        isStarred: false,
        });
    }

    static async putUpdate(req, res) {
        const { id } = req.params;
        const { name } = req.body;
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Not found' });
        await dbClient.db.collection('files').updateOne({ _id: ObjectId(id) }, { $set: { name } });
        return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
        });
    }

    static async deleteDestroy(req, res) {
        const { id } = req.params;
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Not found' });
        await dbClient.db.collection('files').deleteOne({ _id: ObjectId(id) });
        return res.status(204).end();
    }

           
}

export default FilesController;



