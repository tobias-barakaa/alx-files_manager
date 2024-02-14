/* eslint-disable no-param-reassign */
import {
    existsSync, mkdir, writeFileSync,
  } from 'fs';
  import { ObjectId } from 'mongodb';
  import { v4 as uuidv4 } from 'uuid';
  import path from 'path';
  import mime from 'mime-types';
  import dbClient from '../utils/db';
  import redisClient from '../utils/redis';
  
  class FilesController {
    static async postUpload(req, res) {
      const token = req.header('X-Token');
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const user = await dbClient.db.collection('users')
        .findOne({ _id: ObjectId(userId) });
      if (!user) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const {
        name, type, parentId, isPublic, data,
      } = req.body;
  
      if (!name) {
        res.status(400).send({ error: 'Missing name' });
        return;
      }
      const acceptedTypes = ['folder', 'file', 'image'];
      if (!type || (!type && !acceptedTypes.includes(type))) {
        res.status(400).send({ error: 'Missing type' });
        return;
      }
  
      if (!data && type !== 'folder') {
        res.status(400).send({ error: 'Missing data' });
        return;
      }
  
      if (parentId) {
        const parent = await dbClient.db.collection('files')
          .findOne({ _id: ObjectId(parentId), userId: user._id });
        if (!parent) {
          res.status(400).send({ error: 'Parent not found' });
          return;
        }
        if (parent.type !== 'folder') {
          res.status(400).send({ error: 'Parent is not a folder' });
          return;
        }
      }
      const newFile = {
        userId: user._id.toString(),
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      };
      if (type === 'folder') {
        const file = await dbClient.db.collection('files')
          .insertOne(newFile);
        newFile.id = file.insertedId;
        delete newFile._id;
        res.status(201).send(newFile);
      } else {
        const localPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const filename = uuidv4();
        const filePath = path.join(localPath, filename);
        if (!existsSync(localPath)) {
          await mkdir(localPath, { recursive: true }, (err) => {
            if (err) console.log('Not created');
          });
        }
        const decodedData = Buffer.from(data, 'base64');
        writeFileSync(filePath, decodedData, 'utf8');
        newFile.localPath = filePath;
        await dbClient.db.collection('files').insertOne(newFile);
        newFile.id = newFile._id;
        delete newFile._id;
        delete newFile.localPath;
        res.status(201).send(newFile);
      }
    }
  
    static async getShow(req, res) {
      const { id } = req.params;
      const token = req.header('X-Token');
      const key = `auth_${token}`;
  
      const userId = await redisClient.get(key);
  
      if (!userId) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const user = await dbClient.db.collection('users')
        .findOne({ _id: ObjectId(userId) });
  
      const file = await dbClient.db.collection('files')
        .findOne({
          _id: ObjectId(id),
          userId: user._id,
        });
      console.log('The object id is ', ObjectId(id));
      console.log('The user id is ', user._id);
      console.log(await dbClient.db.collection('files')
        .findOne({ _id: ObjectId(id) }));
      console.log(await dbClient.db.collection('files')
        .findOne({ userId: user._id }));
      console.log('The file is ', file);
      console.log(user);
      if (!file) {
        res.status(404).send({ error: 'Not found' });
        return;
      }
      const result = {
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      };
      res.status(200).send(result);
    }
  
    static async getIndex(req, res) {
      const token = req.header('X-Token');
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
  
      if (!userId) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const user = await dbClient.db.collection('users')
        .findOne({ _id: ObjectId(userId) });
      if (!user) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const { parentId, pageNum } = req.query;
      const page = pageNum || 0;
      console.log(parentId, page);
      const size = 20;
      let query;
      if (!parentId) {
        query = { userId: user._id.toString() };
      } else {
        query = { userId: user._id.toString(), parentId };
      }
      const files = await dbClient.db.collection('files')
        .aggregate({ query })
        .skip(page * size)
        .limit(size)
        .toArray();
      if (!files) {
        res.status(200).send([]);
        return;
      }
  
      // console.log(files);
      files.map((file) => {
        file.id = file._id;
        delete file.localPath;
        delete file._id;
        return file;
      });
      res.status(200).send(files);
    }
  
    static async putPublish(req, res) {
      const token = req.header('X-Token');
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const user = await dbClient.db.collection('users')
        .findOne({ _id: ObjectId(userId) });
      if (!user) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const { id } = req.params;
      const file = await dbClient.db.collection('files')
        .findOne({
          _id: ObjectId(id),
          userId: user._id,
        });
      if (!file) {
        res.status(404).send({ error: 'Not found' });
        return;
      }
      const newFile = {
        id: file._id,
        ...file,
      };
      newFile.isPublic = true;
      delete newFile._id;
      delete newFile.localPath;
      res.status(200).send(newFile);
    }
  
    static async putUnpublish(req, res) {
      const token = req.header('X-Token');
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const user = await dbClient.db.collection('users')
        .findOne({ _id: ObjectId(userId) });
      if (!user) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const { id } = req.params;
      const file = await dbClient.db.collection('files')
        .findOne({
          _id: ObjectId(id),
          userId: user._id,
        });
      if (!file) {
        res.status(404).send({ error: 'Not found' });
        return;
      }
      const newFile = {
        id: file._id,
        ...file,
      };
      newFile.isPublic = false;
      delete newFile._id;
      delete newFile.localPath;
      res.status(200).send(newFile);
    }
  
    static async getFile(req, res) {
      const token = req.header('X-Token');
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
  
      const user = await dbClient.db.collection('users')
        .findOne({ _id: ObjectId(userId) });
  
      const { id } = req.params;
      const file = await dbClient.db.collection('files')
        .findOne({ _id: ObjectId(id) });
      if ((!file)
      || (!file.isPublic && !user)
      || (!existsSync(file.localPath))) {
        res.status(404).send({ error: 'Not found' });
        return;
      }
  
      if (file.type === 'folder') {
        res.status(400).send({ error: 'A folder doesn\'t have content' });
        return;
      }
      res.set('Content-Type', mime.lookup(file.name));
    res.status(200).sendFile(file.localPath);
  }
}

export default FilesController;
