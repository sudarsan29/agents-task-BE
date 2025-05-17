const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MONGODB_URL } = require('./config');

const app = express();

// Connect to MongoDB
mongoose.connect(MONGODB_URL);
mongoose.connection.on("connected", () => {
    console.log("DB Connected");
});
mongoose.connection.on("error", (error) => {
    console.log("DB not connected", error);
});

// List of allowed origins
const allowedOrigins = [
  'https://agents-task-fe-git-main-sudarsans-projects-b49c7388.vercel.app',
  'https://agents-task-osk0j6uw5-sudarsans-projects-b49c7388.vercel.app/',
  'https://agents-task-fe.vercel.app', // if you have multiple frontends or preview URLs
];

// CORS setup with dynamic origin
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browsers
};


// Import models 
require('./models/user_model');
require('./models/agent_model');
require('./models/task_model');
require('./models/list_model');

// import routes 
const uploadRoutes = require('./routes/upload_route');
const userRoutes = require('./routes/user_route');
const agentRoutes = require('./routes/agent_route');
const taskRoutes = require('./routes/task_route');

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Use routes
app.use('/api/upload', uploadRoutes);
app.use('/api/user', userRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/task', taskRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("Server Connected");
});
