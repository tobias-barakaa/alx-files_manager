import express from 'express';
// import routes from './routes';
import controllerRouting from './routes';


const app = express();
const port = 5000;

app.use('/', controllerRouting);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
