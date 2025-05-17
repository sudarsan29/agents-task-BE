const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const protectedResource = require('../middleware/protectedResource');
const multer = require('multer');
const AgentModel = require('../models/agent_model'); 



router.post('/create-agent', protectedResource, async (req, res) => {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
        return res.status(400).json({ error: "One or more fields are empty" });
    }
    AgentModel.findOne({ email: email })
        .then((userInDB) => {
            if (userInDB) {
                return res.status(500).json({ error: "Agent with this email already exists" });
            }
            bcryptjs.hash(password, 16)
                .then((hashedPassword) => {
                    const user = new AgentModel({ name, email, mobile, password: hashedPassword, createdBy: req.userId, });
                    user.save()
                        .then((newUser) => {
                            res.status(201).json({ result: "Agent created Successfully" });
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                });
        });
});

router.get('/all-agents', async (req, res) => {
    try{
        const agents = await AgentModel.find();
        res.status(200).json({ agents });
    } catch (error) {
        res.status(500).json({ error: "Unable to Fecth Agents"});
    }
});

router.put('/update-agent/:id', protectedResource, async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and Email are required" });
    }

    try {
        const updatedAgent = await AgentModel.findByIdAndUpdate(
            req.params.id,
            { name, email },
            { new: true }
        );

        if (!updatedAgent) {
            return res.status(404).json({ error: "Agent not found" });
        }

        res.status(200).json({ message: "Agent updated successfully", agent: updatedAgent });
    } catch (error) {
        console.error("Error updating agent:", error);
        res.status(500).json({ error: "Server error while updating agent" });
    }
});

router.delete('/delete-agent/:id', protectedResource, async (req, res) => {
    try {
        const deletedAgent = await AgentModel.findByIdAndDelete(req.params.id);
        if (!deletedAgent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        res.status(200).json({ message: "Agent deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error while deleting agent" });
    }
});

module.exports = router;