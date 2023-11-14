const mongoose = require("mongoose");
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// const crypto = require("crypto");
// const secretKey1 = crypto.randomBytes(32).toString("hex");
// console.log(secretKey1);
const app = express(); 
const port = 2000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.send('Hello World!');
});
// MongoDB connection
//mongodb+srv://<username>:<password>@cluster0.fvjbro5.mongodb.net/<database>?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://mahamh:22331100@cluster0.u1nmgbw.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
  console.log("connected")
  })
  .catch((error)=>{
      console.log("errorr with connecting with db",error)
  })

// Task and User models
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  dueDate: {
    type: Date,
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true },
});

const Task = mongoose.model('Task', taskSchema);
const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.json());

// Authentication middleware
// const authenticateToken = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) return res.status(401).send('Access Denied');

//   jwt.verify(token, 'secretKey', (err, user) => {
//     if (err) return res.status(403).send('Invalid Token');
//     req.user = user;
//     next();
//   });
// };


// Signup route
app.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create a new user
    const newUser = new User({ username, password, email });
    await newUser.save();

    // Mock user authentication for simplicity
    const user = { username };
    const accessToken = jwt.sign(user, 'secretKey');
    res.json({ accessToken });
  } catch (error) {
    res.status(500).send(error.message);
  }
});









// Routes
app.post('/login', (req, res) => {
  // In a real-world scenario, you should validate the username and password against the database
  const username = req.body.username;
  const password = req.body.password;

  // Mock user authentication
  if (username === 'user' && password === 'password') {
    const user = { username: 'user' };
    const accessToken = jwt.sign(user, 'secretKey');
    res.json({ accessToken: accessToken });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Protected routes
// app.use(authenticateToken);

// Fetch all tasks
app.get('/gettasks', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add a new task
app.post('/tasks', async (req, res) => {
  try {
    const task = new Task({ ...req.body, user: req.user._id });
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Update task status
app.patch('/updatetasks/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { completed: req.body.completed },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Delete a task
app.delete('/delettasks/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json(task);
  } catch (error) {
    res.status(400).send(error.message);
  }
});








app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
