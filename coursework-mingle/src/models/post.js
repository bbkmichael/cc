const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  topic:       [{ type: String, enum: ['Politics', 'Health', 'Sport', 'Tech'], required: true }],
  message:     { type: String, required: true },
  ownerName:   { type: String, required: true },
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt:   { type: Date, default: Date.now },
  expiresAt:   { type: Date, required: true },
  status:      { type: String, enum: ['Live', 'Expired'], default: 'Live' },
  likes:       { type: Number, default: 0 },
  dislikes:    { type: Number, default: 0 },
  comments: [{
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username:  String,
    comment:   String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// update status flag
postSchema.methods.updateStatus = function() {
  if (this.expiresAt < new Date()) {
    this.status = 'Expired';
  }
};

module.exports = mongoose.model('Post', postSchema);

