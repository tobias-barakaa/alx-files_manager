// Importing necessary modules
import express from 'express'; //Express framework
import startServer from './libs/boot'; //server bootstrapping function
import injectRoutes from './routes'; // route injection function
import injectMiddlewares from './libs/middlewares'; //injection function

// Creating an instance of Express application
const server = express();

// Injecting middlewares into the Express application
injectMiddlewares(server);

// Injecting routes into the Express application
injectRoutes(server);

// Starting the server by invoking the bootstrapping function
startServer(server);

// Exporting the Express application instance for external use
export default server;
