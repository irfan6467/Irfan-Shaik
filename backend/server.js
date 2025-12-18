/**
 * BACKEND SERVER (Node.js + Express + MongoDB)
 * 
 * To run this:
 * 1. Initialize project: npm init -y
 * 2. Install deps: npm install express mongoose cors body-parser dotenv
 * 3. Run: node server.js
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for image base64

// --- MONGODB CONNECTION ---
// Replace with your MongoDB connection string (e.g. from MongoDB Atlas)
const MONGO_URI = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/custemo?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// --- SCHEMAS ---

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  role: { type: String, default: 'customer' },
  avatar: String,
  createdAt: { type: Date, default: Date.now }
});

const DesignSchema = new mongoose.Schema({
  userId: String,
  name: String,
  state: Object, // Stores the full CustomizationState JSON
  previewImage: String, // Base64 string
  createdAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  totalAmount: Number,
  status: { type: String, default: 'pending' },
  shippingAddress: Object,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Design = mongoose.model('Design', DesignSchema);
const Order = mongoose.model('Order', OrderSchema);

// --- API ROUTES ---

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.json({ id: user._id, email: user.email, name: user.name, role: user.role, avatar: user.avatar });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, name } = req.body;
  const newUser = new User({ 
    email, 
    name, 
    role: 'customer',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
  });
  await newUser.save();
  res.json({ id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role, avatar: newUser.avatar });
});

// Designs
app.post('/api/designs', async (req, res) => {
  const { userId, state, name, previewImage } = req.body;
  const design = new Design({ userId, state, name, previewImage });
  await design.save();
  res.json({ ...design.toObject(), id: design._id });
});

app.get('/api/designs/:userId', async (req, res) => {
  const designs = await Design.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(designs.map(d => ({ ...d.toObject(), id: d._id })));
});

app.get('/api/admin/designs', async (req, res) => {
  const designs = await Design.find().sort({ createdAt: -1 });
  res.json(designs.map(d => ({ ...d.toObject(), id: d._id })));
});

// Orders
app.post('/api/orders', async (req, res) => {
  const { userId, items, totalAmount, shippingAddress } = req.body;
  const order = new Order({ userId, items, totalAmount, shippingAddress });
  await order.save();
  res.json({ ...order.toObject(), id: order._id });
});

app.get('/api/orders/:userId', async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(orders.map(o => ({ ...o.toObject(), id: o._id })));
});

app.get('/api/admin/orders', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders.map(o => ({ ...o.toObject(), id: o._id })));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
