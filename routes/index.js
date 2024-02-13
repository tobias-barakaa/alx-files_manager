const express = require('express');

// const router = express.Router();

const AppController = require('../controllers/AppController');

const UsersController = require('../controllers/UsersController');

// router.get('/status', AppController.getStatus);
// router.get('/stats', AppController.getStats);
// router.post('/users', UsersController.postNew);

// module.exports = router;


function controllerRouting(app) {
    const router = express.Router();
    app.use('/', router);
  
    // App Controller
  
    // should return if Redis is alive and if the DB is alive
    router.get('/status', (req, res) => {
      AppController.getStatus(req, res);
    });
  
    // should return the number of users and files in DB
    router.get('/stats', (req, res) => {
      AppController.getStats(req, res);
    });
  
    // User Controller
  
    // should create a new user in DB
    router.post('/users', (req, res) => {
      UsersController.postNew(req, res);
    });
  
    // should retrieve the user base on the token used
    router.get('/users/me', (req, res) => {
      UsersController.getMe(req, res);
    });
  
  }
  
  export default controllerRouting;
