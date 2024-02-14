import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './routes/index';

const app = express();
const port = 5000;

// Middleware function for logging requests
const logMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

// Middleware function for handling errors
const errorHandlerMiddleware = (err, req, res) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
};

app.use(bodyParser.json());
app.use(logMiddleware);
app.use('/', userRouter);
app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
