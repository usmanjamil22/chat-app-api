const mongoose = require("mongoose");

let Schema = new mongoose.Schema({
  type: mongoose.Schema.Types.String,
  name: mongoose.Schema.Types.String,
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      text: mongoose.Schema.Types.String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

Schema.pre('save', function(next) {
  if (this.type === 'private') this.name = 'private';
  next();
});

module.exports = mongoose.model("Chat", Schema);
