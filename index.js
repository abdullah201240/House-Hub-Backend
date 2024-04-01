import express from 'express';
import mongoose from 'mongoose';
import Routes  from './routes/userRoute.js';

const app = express();
const port = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost:27017/HouseHub', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(express.json());
app.use('/upload', express.static("upload"));

app.use('/', Routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello");
});
