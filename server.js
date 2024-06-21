const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@gym-gram-cluster.rt37wmj.mongodb.net/gym-gram?retryWrites=true&w=majority&appName=gym-gram-cluster`,
    {
      useNewUrlParser: true,
    },
  )
  .then(() => console.log('Database connected successfully'));

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
