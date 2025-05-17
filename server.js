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
  'agents-task-k87t33325-sudarsans-projects-b49c7388.vercel.app',
  'https://agents-task-fe.vercel.app', // if you have multiple frontends or preview URLs
];

// CORS setup with dynamic origin
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true,
}));

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
app.use(cors());
app.use(express.json());

// Use routes
app.use(uploadRoutes);
app.use(userRoutes);
app.use(agentRoutes);
app.use(taskRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("Server Connected");
});
