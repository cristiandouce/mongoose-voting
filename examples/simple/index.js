import express from 'express';
import mongoose from 'mongoose';
import voting from 'mongoose-voting';

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mongoose-voting-example';

// Define Schemas
const UserSchema = new mongoose.Schema({ name: String });
const User = mongoose.model('User', UserSchema);

const ItemSchema = new mongoose.Schema({ title: String });
ItemSchema.plugin(voting, { ref: 'User' });
const Item = mongoose.model('Item', ItemSchema);

// Routes
app.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

app.post('/items', async (req, res) => {
  const item = await Item.create(req.body);
  res.json(item);
});

app.post('/items/:id/vote/up', async (req, res) => {
  const { userId } = req.body;
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.upvote(userId);
  await item.save();

  res.json(item);
});

app.post('/items/:id/vote/down', async (req, res) => {
  const { userId } = req.body;
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.downvote(userId);
  await item.save();

  res.json(item);
});

app.get('/items/:id', async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  res.json({
    _id: item._id,
    title: item.title,
    upvotes: item.upvotes(),
    downvotes: item.downvotes(),
    total: item.votes(),
  });
});

// Start
mongoose.connect(MONGO_URI).then(() => {
  console.log('[API] Connected to MongoDB');
  app.listen(3000, () => {
    console.log('[API] Server running on port 3000');
  });
});
