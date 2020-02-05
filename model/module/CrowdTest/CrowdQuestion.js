const Mongoose = require("mongoose");

const CrowdQuestionSchema = new Mongoose.Schema({
  Text: String,
  Author: {
    _id: Mongoose.Schema.Types.ObjectId
  },
  Options: [String],
  Correct: Number,
  Difficulty: Number,
  Tags: [String]
});

module.exports = Mongoose.model("CrowdQuestion", CrowdQuestionSchema);