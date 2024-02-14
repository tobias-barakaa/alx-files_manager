import { ObjectId } from 'mongodb';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  upload: async (req, res) => {
    const token = req.header('X-Token');
    const { name } = req.body;
    const { type, data } = req.file;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

        const userId = await redisClient.get(`auth_${token}`);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!fs.existsSync(FOLDER_PATH)) {
            fs.mkdirSync(FOLDER_PATH, { recursive: true });
        }

        const filePath = `${FOLDER_PATH}/${uuidv4()}`;
        fs.writeFile(filePath, data, { encoding: 'base64' }, async (err) => {
            if (err) {
                return res.status(500).json({ error: 'Upload failed' });
            }

            const result = await dbClient.db.collection('files').insertOne({
                userId: user._id,
                name,
                type,
                path: filePath,
            });

            return res.status(201).json({
                id: result.insertedId,
                userId: user._id,
                name,
                type,
            });
        });

        // Default return statement
        return null;
    },
    
};

export default FilesController;
