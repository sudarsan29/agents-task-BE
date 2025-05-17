const express = require("express");
const router = express.Router();
const TaskModel = require("../models/task_model");
const protectedResource = require('../middleware/protectedResource');

router.post('/create-task', protectedResource, async (req, res) => {
  const { title, description, assignedTo } = req.body;
  if (!title || !description || !assignedTo) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const task = new TaskModel({ title, description, assignedTo });
    await task.save();
    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Server error while creating task" });
  }
});

// GET all tasks - PUBLIC
router.get("/all-tasks", async (req, res) => {
  try {
    const tasks = await TaskModel.find();
    res.status(200).json({ tasks }); // Send tasks inside an object for consistency
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.get('/agent-tasks/:agentId', protectedResource, async (req, res) => {
    const { agentId } = req.params;

    try {
        const tasks = await TaskModel.find({ assignedTo: agentId });
        res.status(200).json({ tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Failed to fetch agent tasks" });
    }
});

router.put('/update-task/:id', protectedResource, async (req, res) => {
    const { title, description, assignedTo } = req.body;
    try {
        const updatedTask = await TaskModel.findByIdAndUpdate(
            req.params.id,
            { title, description, assignedTo },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json({ message: "Task updated successfully", task: updatedTask });
    } catch (error) {
        res.status(500).json({ error: "Server error while updating task" });
    }
});

router.delete('/delete-task/:id', protectedResource, async (req, res) => {
    try {
        const deletedTask = await TaskModel.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error while deleting task" });
    }
});

module.exports = router;
