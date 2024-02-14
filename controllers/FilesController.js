/* eslint-disable */
import { ObjectId } from 'mongodb';
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dbClient from '../utils/db';

const FilesController = {
    postUpload: async (req, res) => {
        const { name, type, data } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }
        if (!type) {
            return res.status(400).json({ error: 'Missing type' });
        }
        if (!data) {
            return res.status(400).json({ error: 'Missing data' });
        }
        const file = {
            name,
            type,
            parentId: 0,
        };
        const result = await dbClient.db.collection('files').insertOne(file);
        const { _id } = result.ops[0];
        const filePath = path.join(__dirname, '../', process.env.FOLDER_PATH, _id);
        writeFileSync(filePath, data, 'base64');
        return res.status(201).json({ id: _id, name, type });
    },
    getShow: async (req, res) => {
        const fileId = req.params.id;
        let file;
        try {
            file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
        } catch (error) {
            return res.status(404).json({ error: 'Not found' });
        }
        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }
        const filePath = path.join(__dirname, '../', process.env.FOLDER_PATH, fileId);
        return res.status(200).sendFile(filePath);
    },
    getIndex: async (req, res) => {
        const parentId = req.params.id || 0;
        let files;
        try {
            files = await dbClient.db.collection('files').find({ parentId }).toArray();
        } catch (error) {
            return res.status(404).json({ error: 'Not found' });
        }
        return res.status(200).json(files);
    },
    putPublish: async (req, res) => {
        const fileId = req.params.id;
        let file;
        try {
            file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
        } catch (error) {
            return res.status(404).json({ error: 'Not found' });
        }
        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }
        await dbClient.db.collection('files').updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: true } });
        return res.status(200).json({ id: file._id, name: file.name, isPublic: true });
    },
    putUnpublish: async (req, res) => {
        const fileId = req.params.id;
        let file;
        try {
            file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
        } catch (error) {
            return res.status(404).json({ error: 'Not found' });
        }
        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }
        await dbClient.db.collection('files').updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: false } });
        return res.status(200).json({ id: file._id, name: file.name, isPublic: false });
    },
    getFile: async (req, res) => {
        const fileId = req.params.id;
        let file;
        try {
            file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
        } catch (error) {
            return res.status(404).json({ error: 'Not found' });
        }
        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }
        const filePath = path.join(__dirname, '../', process.env.FOLDER_PATH, fileId);
        return res.status(200).sendFile(filePath);
    },
};

export default FilesController;


