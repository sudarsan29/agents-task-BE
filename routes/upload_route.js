const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const AgentModel = mongoose.model('AgentModel');
const ListModel = mongoose.model('ListModel');
const protectedResource = require('../middleware/protectedResource');

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/upload-csv', protectedResource, upload.single('file'), async (req, res) => {
    const results = [];
    try {
        const agents = await AgentModel.find();
        if (agents.length < 5) {
            return res.status(400).json({ error: "5 Agents are required to distribute task" });
        }

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                fs.unlinkSync(req.file.path); 

                let agentIndex = 0;
                const createdTasks = []; 

                for (let i = 0; i < results.length; i++) {
                    const task = new TaskModel({
                        title: results[i].title || results[i].task,
                        description: results[i].description || '',
                        assignedTo: agents[agentIndex]._id 
                    });

                    const savedTask = await task.save();
                    createdTasks.push(savedTask);

                    agentIndex = (agentIndex + 1) % agents.length;
                }

                res.status(200).json({ message: "Tasks distributed Successfully", tasks: createdTasks });
            });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// File filter to allow only csv, xls, xlsx
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.csv', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only .csv, .xls, and .xlsx files are allowed'), false);
    }
};

// Upload and distribute list
router.post('/upload-list', protectedResource, upload.single('file'), async (req, res) => {
    const results = [];

    try {
        // Check for agents
        const agents = await AgentModel.find();
        if (agents.length < 5) {
            return res.status(400).json({ error: "5 Agents are required to distribute the list" });
        }

        // Validate file
        if (!req.file) {
            return res.status(400).json({ error: "File is required and must be .csv/.xls/.xlsx" });
        }

        // Read and parse CSV
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                // Basic row validation
                if (row.FirstName && row.Phone) {
                    results.push({
                        firstName: row.FirstName,
                        phone: row.Phone,
                        notes: row.Notes || ""
                    });
                }
            })
            .on('end', async () => {
                fs.unlinkSync(req.file.path); // Delete file

                // Distribute data among 5 agents
                let agentIndex = 0;
                const createdLists = [];

                for (let i = 0; i < results.length; i++) {
                    const list = new ListModel({
                        firstName: results[i].firstName,
                        phone: results[i].phone,
                        notes: results[i].notes,
                        assignedTo: agents[agentIndex]._id
                    });

                    const savedList = await list.save();
                    createdLists.push(savedList);

                    agentIndex = (agentIndex + 1) % agents.length;
                }

                return res.status(200).json({
                    message: "List uploaded and distributed successfully",
                    lists: createdLists
                });
            });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
