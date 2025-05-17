const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    required: true
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AgentModel' 
  }
});

module.exports = mongoose.model('ListModel', listSchema);
