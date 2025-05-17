const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config.js');
const mongoose = require('mongoose');
const UserModel = mongoose.model('UserModel');

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, JWT_SECRET, async (error, payload) => {
    if (error) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const { _id, role } = payload; 

    try {
      const dbUser = await UserModel.findById(_id).select("-password");

      if (!dbUser) {
        return res.status(401).json({ error: "User not found" });
      }

      req.user = dbUser;
      req.user.role = role; 
      req.userId = _id;

      next();
    } catch (err) {
      console.error("DB error in auth middleware:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });
};