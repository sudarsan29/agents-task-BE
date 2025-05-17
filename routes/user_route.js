const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const UserModel = mongoose.model('UserModel');
const {JWT_SECRET} = require('../config');
const protectedResource = require('../middleware/protectedResource');

router.post('/signup', (req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        return res.status(401).json({ error: "One or more fields are empty"})
    }
    UserModel.findOne({email: email})
    .then((userInDB) => {
        if(userInDB){
            return res.status(500).json({ error: "User with this email already existed"});
        }
        bcryptjs.hash(password, 16)
        .then((hashedPassword) => {
            const user = new UserModel({name, email, password: hashedPassword});
            user.save()
            .then((newUser) => {
                res.status(201).json({result: "User signed up Successfully"});
            })
            .catch((error) => {
                console.log(error);
            })
        })
    })
})

router.post('/login', (req,res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({ error: "One or more fields are empty"});
    }
    UserModel.findOne({ email: email})
    .then((userInDB) => {
        if(!userInDB){
            return res.status(401).json({error: "Invalid Credentials"});
        }
        bcryptjs.compare(password, userInDB.password)
        .then((didMatch) => {
            if(didMatch){
                const jwtToken = jwt.sign({_id: userInDB._id, role: "admin"}, JWT_SECRET);
                const userInfo = {"email": userInDB.email, "name": userInDB.name};
                res.status(200).json({ token: jwtToken, user: userInfo });
            } else {
                return res.status(401).json({error: "Invalid Credenials"});
            }
        })
        .catch((error) => {
            console.log(error);
        })
    })
    .catch((error) => {
        console.log(error);
    })
});

router.get("/user", protectedResource, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error in /user route:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;