const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AgentModel',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const TaskModel = mongoose.model('TaskModel', taskSchema);

module.exports = TaskModel; 