const { model, Schema } = require("mongoose");

const User = model(
  "User",
  new Schema({
    username: Schema.Types.String,
    email: Schema.Types.String,
    password: Schema.Types.String,
  })
);

module.exports = User;
