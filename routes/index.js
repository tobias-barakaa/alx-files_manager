import express from 'express';
import controllerfunctions from '../controllers/AppController';

const router = express.Router();

router.get('/status', controllerfunctions.getStatus);
router.get('/stats', controllerfunctions.getStats);

module.exports = router;
