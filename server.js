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
const PORT = 4000;
app.listen(PORT, () => {
    console.log("Server Connected");
});
