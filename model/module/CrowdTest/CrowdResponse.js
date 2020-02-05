const Mongoose = require("mongoose");

const CrowdResponseSchema = new Mongoose.Schema({
  Author: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Question: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Selection: Number,
  Score: Number
});

module.exports = Mongoose.model("CrowdResponse", CrowdResponseSchema);